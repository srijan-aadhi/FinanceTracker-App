from rest_framework.response import Response
from rest_framework import status
from django.db.models import Sum
from .models import Transaction, Budget, Category, Profile
from .serializers import TransactionSerializer, BudgetSerializer, CategorySerializer, UserSerializer, ProfileSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from django.contrib.auth import authenticate, login
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from django.utils.timezone import now  
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.db.models.functions import ExtractYear

@api_view(["GET"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def annual_spending(request):
    """
    Returns [{year: 2023, total: 5400.75}, …] of *negative* transaction amounts
    (expenses) aggregated per calendar year for the current user.
    """
    qs = (
        Transaction.objects
        .filter(user=request.user, amount__lt=0)
        .annotate(year=ExtractYear("date"))
        .values("year")
        .annotate(total=Sum("amount"))          # total is negative
        .order_by("year")
    )

    data = [
        {"year": row["year"], "total": abs(row["total"])}
        for row in qs
    ]
    return Response(data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def set_password(request):
    """
    POST /api/users/set_password/
    {
      "current_password": "...",
      "new_password": "..."
    }
    """
    user = request.user
    curr = request.data.get('current_password')
    new  = request.data.get('new_password')

    # Check current password
    if not user.check_password(curr):
        return Response({'detail': 'Current password is incorrect.'}, status=400)

    # Set the new one
    user.set_password(new)
    user.save()

    return Response({'detail': 'Password updated successfully.'})


@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def profile_view(request):
    # Get or create the Profile for this user
    profile, _ = Profile.objects.get_or_create(user=request.user)

    if request.method == 'GET':
        return Response(ProfileSerializer(profile).data)

    # For PUT, pull out form data
    data = request.data
    full_name = data.get('full_name', '')
    email     = data.get('email')
    currency  = data.get('currency')

    # Update currency
    if currency:
        profile.currency = currency
        profile.save()

    # Update User fields
    if full_name:
        first, *rest = full_name.strip().split(' ', 1)
        request.user.first_name = first
        request.user.last_name  = rest[0] if rest else ''
    if email:
        request.user.email = email
    request.user.save()

    return Response(ProfileSerializer(profile).data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_info(request):
    return Response({
        'id': request.user.id,
        'email': request.user.email,
        'username': request.user.username,
    })

User = get_user_model()

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user_view(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)

from backend.utils import create_default_categories

class RegisterUserView(APIView):
    permission_classes = [AllowAny]
    def get_permissions(self):
        return [AllowAny()]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        if not email or not password:
            return Response({'error': 'Email and password required'}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(email=email).exists():
            return Response({'error': 'User already exists'}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(username=email, email=email, password=password)
        create_default_categories(user)
        return Response({'message': 'User created successfully'}, status=status.HTTP_201_CREATED)

class SessionLoginView(APIView):
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        user = authenticate(request, username=email, password=password)
        if user is not None:
            login(request, user)
            return Response({'detail': 'Logged in successfully'}, status=status.HTTP_200_OK)
        return Response({'detail': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def protected_view(request):
    return Response({'message': f'Hello, {request.user.email}'})

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def transaction_list(request):
    if request.method == 'GET':
        transactions = Transaction.objects.filter(user=request.user).order_by('-date')
        # e.g. in your transaction_list view
        serializer = TransactionSerializer(transactions, many=True)

        return Response(serializer.data)
    elif request.method == 'POST':
        serializer = TransactionSerializer(data=request.data, context={'request': request})

        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT', 'DELETE'])
@permission_classes([IsAuthenticated])        # require a logged-in user
def transaction_detail(request, pk):
    try:
        transaction = Transaction.objects.get(pk=pk)
    except Transaction.DoesNotExist:
        return Response({'error': 'Transaction not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'PUT':
        # NEW — include the request in context so CurrentUserDefault can find it
        serializer = TransactionSerializer(
            transaction,
            data=request.data,
            context={'request': request}
        )

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        transaction.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
def dashboard_summary(request):
    transactions = Transaction.objects.filter(user=request.user)
    current = now()
    
    monthly_spending = transactions.filter(
        date__year=current.year,
        date__month=current.month,
        amount__lt=0
    ).aggregate(total=Sum('amount'))['total'] or 0

    yearly_spending = transactions.filter(
        date__year=current.year,
        amount__lt=0
    ).aggregate(total=Sum('amount'))['total'] or 0

    # Get total budget for the current month
    monthly_budget = Budget.objects.filter(
        month__year=current.year,
        month__month=current.month
    ).aggregate(total=Sum('amount'))['total'] or 0

    recent_transactions = transactions.order_by('-date')[:5]
    serializer = TransactionSerializer(recent_transactions, many=True)

    return Response({
        'monthlySpending': abs(monthly_spending),
        'monthlyBudget': monthly_budget,
        'yearlySpending': abs(yearly_spending),
        'recentTransactions': serializer.data
    })


@api_view(['GET', 'POST'])
def budget_list(request):
    if request.method == 'GET':
        budgets = Budget.objects.all()
        serializer = BudgetSerializer(budgets, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        serializer = BudgetSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT', 'DELETE'])
def budget_detail(request, pk):
    try:
        budget = Budget.objects.get(pk=pk)
    except Budget.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'PUT':
        serializer = BudgetSerializer(budget, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        budget.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(["GET", "POST"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def category_list(request):
    if request.method == "GET":
        categories = Category.objects.filter(user=request.user)
        return Response(CategorySerializer(categories, many=True).data)

    # POST
    serializer = CategorySerializer(data=request.data, context={"request": request})
    if serializer.is_valid():
        serializer.save(user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["PUT", "DELETE"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def category_detail(request, pk):
    try:
        category = Category.objects.get(pk=pk, user=request.user)
    except Category.DoesNotExist:
        return Response({"error": "Category not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "PUT":
        serializer = CategorySerializer(category, data=request.data,
                                        context={"request": request})
        if serializer.is_valid():
            serializer.save()          # user is unchanged
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # DELETE
    category.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["GET"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def category_summary(request):
    """
    Return totals per category **for this user only**.
    """
    response_data = []
    categories    = Category.objects.filter(user=request.user)

    for cat in categories:
        # Transactions already scoped to user in transaction_list,
        # but we filter again for safety.
        tx_qs = Transaction.objects.filter(user=request.user, category=cat.name)
        total = tx_qs.aggregate(total=Sum("amount"))["total"] or 0

        if cat.type == "income":
            response_data.append({
                "id":           cat.id,
                "name":         cat.name,
                "type":         cat.type,
                "color":        cat.color,
                "total_earned": max(total, 0)
            })
        else:
            response_data.append({
                "id":           cat.id,
                "name":         cat.name,
                "type":         cat.type,
                "color":        cat.color,
                "total_spent":  abs(min(total, 0))
            })

    return Response(response_data)


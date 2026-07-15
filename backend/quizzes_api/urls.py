from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    LoginView,
    RegisterView,
    ListActiveQuizzesView,
    JoinQuizView,
    StartQuizView,
    SubmitQuizView,
    SubmitAnswerView,
    QuizRankingView,
    AdminQuizListCreateView,
    AdminQuizDetailView,
    AdminQuizQuestionsSyncView,
    AdminStatsView
)

urlpatterns = [
    # Autenticación
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Colaborador (Juego)
    path('quizzes/active/', ListActiveQuizzesView.as_view(), name='active_quizzes'),
    path('quizzes/join/<str:codigo_acceso>/', JoinQuizView.as_view(), name='join_quiz'),
    path('quizzes/<int:quiz_id>/start/', StartQuizView.as_view(), name='start_quiz'),
    path('quizzes/<int:intento_id>/submit/', SubmitQuizView.as_view(), name='submit_quiz'),
    path('quizzes/<int:intento_id>/submit-answer/', SubmitAnswerView.as_view(), name='submit_answer'),
    path('quizzes/<int:quiz_id>/ranking/', QuizRankingView.as_view(), name='quiz_ranking'),
    
    # Administración
    path('admin/quizzes/', AdminQuizListCreateView.as_view(), name='admin_quizzes'),
    path('admin/quizzes/<int:pk>/', AdminQuizDetailView.as_view(), name='admin_quiz_detail'),
    path('admin/quizzes/<int:quiz_id>/questions/sync/', AdminQuizQuestionsSyncView.as_view(), name='admin_questions_sync'),
    path('admin/stats/', AdminStatsView.as_view(), name='admin_stats'),
]

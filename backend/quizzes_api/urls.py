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
    AdminStatsView,
    ColaboradorUpdateView,
    ColaboradorChangePasswordView,
    PasswordResetRequestView,
    PasswordResetConfirmView,
    AdminColaboradoresView,
    AdminColaboradorDetailView
)

urlpatterns = [
    # Autenticación
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/profile/update/', ColaboradorUpdateView.as_view(), name='profile_update'),
    path('auth/profile/password/', ColaboradorChangePasswordView.as_view(), name='profile_password'),
    path('auth/password-reset/request/', PasswordResetRequestView.as_view(), name='password_reset_request'),
    path('auth/password-reset/confirm/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    
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
    path('admin/colaboradores/', AdminColaboradoresView.as_view(), name='admin_colaboradores'),
    path('admin/colaboradores/<int:pk>/', AdminColaboradorDetailView.as_view(), name='admin_colaborador_detail'),
]

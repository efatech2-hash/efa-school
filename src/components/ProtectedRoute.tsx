import React, { useEffect } from 'react';
import { UserRole } from '../types/auth';
import { Forbidden403 } from './Forbidden403';

interface ProtectedRouteProps {
  currentRole: UserRole;
  allowedRoles: UserRole[];
  onReturnDashboard: () => void;
  onUnauthorizedAttempt?: (message: string) => void;
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  currentRole,
  allowedRoles,
  onReturnDashboard,
  onUnauthorizedAttempt,
  children,
}) => {
  const isAllowed = allowedRoles.includes(currentRole);

  useEffect(() => {
    if (!isAllowed && onUnauthorizedAttempt) {
      const message = allowedRoles.includes('fondateur') && allowedRoles.length === 1
        ? 'Accès interdit - Réservé Fondateur'
        : 'Accès interdit - Droits insuffisants pour ce module';
      onUnauthorizedAttempt(message);
    }
  }, [isAllowed, allowedRoles, onUnauthorizedAttempt]);

  if (!isAllowed) {
    return (
      <Forbidden403
        currentRole={currentRole}
        requiredRoles={allowedRoles}
        onReturnDashboard={onReturnDashboard}
      />
    );
  }

  return <>{children}</>;
};

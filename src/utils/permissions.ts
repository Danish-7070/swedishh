export interface Permission {
  screen: string;
  action?: string;
}

export interface RolePermissions {
  [key: string]: Permission[];
}

export const ROLE_PERMISSIONS: RolePermissions = {
  admin: [
    { screen: 'dashboard' },
    { screen: 'manager-dashboard' },
    { screen: 'foundations' },
    { screen: 'governance' },
    { screen: 'documents' },
    { screen: 'financial' },
    { screen: 'meetings' },
    { screen: 'expenses' },
    { screen: 'investments' },
    { screen: 'projects' },
    { screen: 'grants' },
    { screen: 'reports' },
    { screen: 'profile' },
    { screen: 'settings' }
  ],
  foundation_owner: [
    { screen: 'dashboard' },
    { screen: 'manager-dashboard' },
    { screen: 'foundations' },
    { screen: 'governance' },
    { screen: 'documents' },
    { screen: 'financial' },
    { screen: 'meetings' },
    { screen: 'expenses' },
    { screen: 'investments' },
    { screen: 'projects' },
    { screen: 'grants' },
    { screen: 'reports' },
    { screen: 'profile' }
  ],
  member: [
    { screen: 'dashboard' },
    { screen: 'documents' },
    { screen: 'meetings' }, // Can view but not create
    { screen: 'expenses' },
    { screen: 'profile' },
  ]
};

export const GOVERNANCE_RESTRICTIONS = {
  member: {
    hideRoleManagement: true,
    hideDocumentWorkflows: true,
    hideRoleBasedAccessControl: true,
    cannotCreateMeetings: true,
    cannotApproveMeetings: true,
    cannotApproveExpenses: true
  },
  foundation_owner: {
    hideRoleManagement: true,
    hideDocumentWorkflows: true,
    hideRoleBasedAccessControl: true
  }
};

export const MEETING_PERMISSIONS = {
  admin: {
    canCreate: true,
    canEdit: true,
    canDelete: true,
    canApprove: true
  },
  foundation_owner: {
    canCreate: true,
    canEdit: true,
    canDelete: true,
    canApprove: true
  },
  member: {
    canCreate: false,
    canEdit: false,
    canDelete: false,
    canApprove: false
  }
};

export function getMeetingPermissions(userRole: string) {
  return MEETING_PERMISSIONS[userRole] || MEETING_PERMISSIONS.member;
}

export function canCreateMeetings(userRole: string): boolean {
  const permissions = getMeetingPermissions(userRole);
  return permissions.canCreate;
}

export function canApproveExpenses(userRole: string): boolean {
  return userRole === 'admin' || userRole === 'foundation_owner';
}

export function hasPermission(userRole: string, screen: string): boolean {
  const permissions = ROLE_PERMISSIONS[userRole] || [];
  return permissions.some(permission => permission.screen === screen);
}

export function getPermittedScreens(userRole: string): string[] {
  const permissions = ROLE_PERMISSIONS[userRole] || [];
  return permissions.map(permission => permission.screen);
}

export function getGovernanceRestrictions(userRole: string) {
  return GOVERNANCE_RESTRICTIONS[userRole] || {};
}

export function getDefaultRoute(userRole: string): string {
  switch (userRole) {
    case 'admin':
      return '/dashboard';
    case 'foundation_owner':
      return '/manager-dashboard';
    case 'member':
      return '/dashboard';
    default:
      return '/dashboard';
  }
}
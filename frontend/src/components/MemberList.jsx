import React from 'react';
import { Crown, Shield, MoreVertical, UserPlus, UserMinus } from 'lucide-react';

export default function MemberList({ member, isOnline, userRole }) {
  const [showMenu, setShowMenu] = React.useState(false);

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'moderator':
        return <Shield className="w-4 h-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'moderator':
        return 'text-blue-600 dark:text-blue-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const canModerate = () => {
    return userRole === 'admin' || userRole === 'moderator';
  };

  const handleRoleChange = (newRole) => {
    // Handle role change logic
    console.log(`Changing ${member.userId.name}'s role to ${newRole}`);
    setShowMenu(false);
  };

  const handleRemoveMember = () => {
    if (window.confirm(`Are you sure you want to remove ${member.userId.name} from this community?`)) {
      // Handle member removal logic
      console.log(`Removing ${member.userId.name} from community`);
    }
    setShowMenu(false);
  };

  return (
    <div className="group relative flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-xs">
          {member.userId.name.charAt(0).toUpperCase()}
        </div>
        {isOnline && (
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
        )}
      </div>

      {/* Member Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {member.userId.name}
          </span>
          {getRoleIcon(member.role)}
        </div>
        <p className={`text-xs ${getRoleColor(member.role)}`}>
          {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
        </p>
        {member.userId.bio && (
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {member.userId.bio}
          </p>
        )}
      </div>

      {/* Status & Actions */}
      <div className="flex items-center gap-2">
        {isOnline && (
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        )}
        
        {canModerate() && userRole !== member.role && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-opacity"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 min-w-[120px]">
                {userRole === 'admin' && (
                  <>
                    {member.role !== 'moderator' && (
                      <button
                        onClick={() => handleRoleChange('moderator')}
                        className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                      >
                        <Shield className="w-4 h-4" />
                        Make Moderator
                      </button>
                    )}
                    {member.role === 'moderator' && (
                      <button
                        onClick={() => handleRoleChange('member')}
                        className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                      >
                        <UserMinus className="w-4 h-4" />
                        Remove Moderator
                      </button>
                    )}
                    <div className="border-t border-gray-200 dark:border-gray-700"></div>
                  </>
                )}
                <button
                  onClick={handleRemoveMember}
                  className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                >
                  <UserMinus className="w-4 h-4" />
                  Remove Member
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
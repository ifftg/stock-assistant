'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { useAuth } from '@/contexts/AuthContext'
import { User, LogOut, Settings } from 'lucide-react'

interface UserAvatarProps {
  onLoginClick: () => void
}

export function UserAvatar({ onLoginClick }: UserAvatarProps) {
  const { user, signOut, loading } = useAuth()
  const [showMenu, setShowMenu] = useState(false)

  if (loading) {
    return (
      <div className="h-10 w-10 rounded-full bg-primary/20 animate-pulse"></div>
    )
  }

  if (!user) {
    return (
      <Button
        onClick={onLoginClick}
        className="glow-button"
        size="sm"
      >
        登录
      </Button>
    )
  }

  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || '用户'
  const avatarUrl = user.user_metadata?.avatar_url

  return (
    <div className="relative">
      <Button
        variant="ghost"
        onClick={() => setShowMenu(!showMenu)}
        className="h-10 w-10 rounded-full p-0 glass-card hover:glow-border"
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            className="h-8 w-8 rounded-full"
          />
        ) : (
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
            <User className="h-4 w-4 text-primary" />
          </div>
        )}
      </Button>

      {showMenu && (
        <div className="absolute right-0 top-12 w-48 glass-card border border-primary/30 rounded-lg shadow-lg z-50">
          <div className="p-3 border-b border-primary/20">
            <p className="font-medium text-foreground truncate">{displayName}</p>
            <p className="text-sm text-muted-foreground truncate">{user.email}</p>
          </div>
          
          <div className="p-2 space-y-1">
            <Button
              variant="ghost"
              className="w-full justify-start text-left"
              onClick={() => {
                setShowMenu(false)
                // TODO: 打开设置页面
              }}
            >
              <Settings className="h-4 w-4 mr-2" />
              设置
            </Button>
            
            <Button
              variant="ghost"
              className="w-full justify-start text-left text-red-400 hover:text-red-300 hover:bg-red-500/10"
              onClick={() => {
                setShowMenu(false)
                signOut()
              }}
            >
              <LogOut className="h-4 w-4 mr-2" />
              退出登录
            </Button>
          </div>
        </div>
      )}
      
      {showMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  )
}

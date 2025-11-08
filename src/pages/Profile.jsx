
import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { Edit, Save, LogOut, Check } from 'lucide-react';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [fullName, setFullName] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await User.me();
        setUser(currentUser);
        setFullName(currentUser.full_name || '');
      } catch (error) {
        console.error("Failed to fetch user:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await User.updateMyUserData({ full_name: fullName });
      setUser(prev => ({ ...prev, full_name: fullName }));
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update user:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await User.logout();
  };
  
  const getInitials = (name) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name[0].toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-12">
        <Skeleton className="h-10 w-48 mb-12" />
        <div className="apple-blur rounded-2xl p-8 apple-shadow">
          <div className="flex items-center gap-6">
            <Skeleton className="w-20 h-20 rounded-full" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
          <Skeleton className="h-10 w-24 mt-8 ml-auto" />
        </div>
      </div>
    );
  }
  
  if (!user) {
     return <div className="text-center p-12">Could not load user profile.</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <header className="mb-12">
          <h1 className="text-4xl font-semibold text-black tracking-tight">Profile</h1>
          <p className="text-lg text-gray-500 mt-2">
            Manage your personal information.
          </p>
        </header>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="apple-blur rounded-2xl p-8 apple-shadow-lg"
        >
          <form onSubmit={handleUpdate}>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-3xl font-medium text-gray-500">
                  {getInitials(user.full_name)}
                </div>
              </div>

              <div className="flex-1 w-full">
                <div className="mb-4">
                  <Label htmlFor="fullName" className="text-sm text-gray-500">Full Name</Label>
                  {isEditing ? (
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="text-lg mt-1"
                      autoFocus
                    />
                  ) : (
                    <p className="text-xl font-medium text-black mt-1">{user.full_name || 'Not set'}</p>
                  )}
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Email</Label>
                  <p className="text-base text-gray-600 mt-1">{user.email}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-8">
              {isEditing ? (
                <div className="flex gap-2">
                  <Button type="button" variant="ghost" onClick={() => setIsEditing(false)} disabled={isSaving}>Cancel</Button>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? <Save className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                    Save
                  </Button>
                </div>
              ) : (
                <Button type="button" onClick={() => setIsEditing(true)}>
                  <Edit className="w-4 h-4 mr-2" /> Edit Profile
                </Button>
              )}
            </div>
          </form>
        </motion.div>
        
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-8"
        >
            <Button
                variant="destructive"
                onClick={handleLogout}
                className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20"
            >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
            </Button>
        </motion.div>
      </div>
    </div>
  );
}

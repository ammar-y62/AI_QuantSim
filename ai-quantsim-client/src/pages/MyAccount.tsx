import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User, Settings, Shield, CreditCard, LogOut } from 'lucide-react'
import { authService } from '@/services/authService'

interface UserProfile {
  name: string
  email: string
  phone: string
  subscription: string
  joinDate: string
}

function MyAccount() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState<UserProfile>({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    subscription: 'Premium',
    joinDate: '2024-01-15'
  })

  const [isEditing, setIsEditing] = useState(false)
  const [tempProfile, setTempProfile] = useState<UserProfile>(profile)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleSave = () => {
    setProfile(tempProfile)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setTempProfile(profile)
    setIsEditing(false)
  }

  const handleLogout = async () => {
    try {
      console.log('Logging out...');
      setIsLoggingOut(true);

      // Logout from Firebase
      console.log('Calling authService.logout()...');
      await authService.logout();
      console.log('Firebase logout completed');

      // Clear any stored data (if using localStorage or sessionStorage)
      console.log('Clearing local storage...');
      localStorage.removeItem('auth-storage')
      sessionStorage.clear()
      console.log('Local storage cleared');

      // Navigate back to login page
      console.log('Navigating to login page...');
      navigate('/login')
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if Firebase logout fails, still redirect to login
      navigate('/login')
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <User className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">My Account</h1>
              <p className="text-slate-600">Manage your profile and settings</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <>
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={tempProfile.name}
                      onChange={(e) => setTempProfile({ ...tempProfile, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={tempProfile.email}
                      onChange={(e) => setTempProfile({ ...tempProfile, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={tempProfile.phone}
                      onChange={(e) => setTempProfile({ ...tempProfile, phone: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleSave} className="flex-1">
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={handleCancel} className="flex-1">
                      Cancel
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-slate-500">Name</span>
                      <span className="text-sm text-slate-900">{profile.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-slate-500">Email</span>
                      <span className="text-sm text-slate-900">{profile.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-slate-500">Phone</span>
                      <span className="text-sm text-slate-900">{profile.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-slate-500">Member Since</span>
                      <span className="text-sm text-slate-900">{profile.joinDate}</span>
                    </div>
                  </div>
                  <Button onClick={() => setIsEditing(true)} className="w-full">
                    Edit Profile
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Subscription */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Subscription
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-slate-500">Current Plan</span>
                  <span className="text-sm font-semibold text-indigo-600">{profile.subscription}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-slate-500">Billing Cycle</span>
                  <span className="text-sm text-slate-900">Monthly</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-slate-500">Next Billing</span>
                  <span className="text-sm text-slate-900">Feb 15, 2024</span>
                </div>
              </div>
              <Button variant="outline" className="w-full">
                Manage Subscription
              </Button>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full">
                Change Password
              </Button>
              <Button variant="outline" className="w-full">
                Enable Two-Factor Authentication
              </Button>
              <Button variant="outline" className="w-full">
                View Login History
              </Button>

              {/* Logout Button */}
              <div className="pt-2 border-t border-slate-200">
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                >
                  {isLoggingOut ? (
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  ) : (
                    <LogOut className="h-4 w-4 mr-2" />
                  )}
                  {isLoggingOut ? 'Logging Out...' : 'Logout'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full">
                Notification Settings
              </Button>
              <Button variant="outline" className="w-full">
                Privacy Settings
              </Button>
              <Button variant="outline" className="w-full">
                Data Export
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default MyAccount
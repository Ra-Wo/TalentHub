"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useSupabase } from "@/context/supabase-provider";
import { useAuth } from "@/hooks/use-auth";
import { updateUserProfile, getUserProfile } from "@/lib/user-profile";
import type { UserProfile } from "@/lib/user-profile";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupText } from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { User, Mail, Loader2, Check } from "lucide-react";

export function SettingsForm() {
  const supabase = useSupabase();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    profileImage: "",
  });

  useEffect(() => {
    async function loadProfile() {
      if (!user?.id) return;

      try {
        setLoading(true);
        const userProfile = await getUserProfile(supabase, user.id);
        setProfile(userProfile);
        setFormData({
          name: userProfile.name || "",
          profileImage: userProfile.profileImage || "",
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load profile");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [user?.id, supabase]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    try {
      setSaving(true);
      setError(null);
      await updateUserProfile(supabase, user.id, {
        name: formData.name || undefined,
        profileImage: formData.profileImage || undefined,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="p-8 flex items-center justify-center">
          <Spinner className="h-6 w-6" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Account Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email (Read-only) */}
          <div className="space-y-2">
            <Label className="ml-1">Email Address</Label>
            <InputGroup>
              <InputGroupText>
                <Mail className="h-4 w-4" />
              </InputGroupText>
              <Input
                type="email"
                value={user?.email || ""}
                disabled
                className="border-0 shadow-none focus-visible:ring-0 bg-muted/50"
              />
            </InputGroup>
            <p className="text-xs text-muted-foreground ml-1">
              Email is managed through your account settings
            </p>
          </div>

          {/* Full Name */}
          <div className="space-y-2">
            <Label className="ml-1">Full Name</Label>
            <InputGroup>
              <InputGroupText>
                <User className="h-4 w-4" />
              </InputGroupText>
              <Input
                type="text"
                name="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleInputChange}
                className="border-0 shadow-none focus-visible:ring-0"
                disabled={saving}
              />
            </InputGroup>
          </div>

          {/* Profile Image URL */}
          <div className="space-y-2">
            <Label className="ml-1">Profile Image URL</Label>
            <Input
              type="url"
              name="profileImage"
              placeholder="https://example.com/image.jpg"
              value={formData.profileImage}
              onChange={handleInputChange}
              className="h-10"
              disabled={saving}
            />
            {formData.profileImage && (
              <div className="mt-2 p-2 bg-muted/30 rounded-lg border border-border">
                <Image
                  src={formData.profileImage}
                  alt="Profile preview"
                  width={64}
                  height={64}
                  className="h-16 w-16 rounded-lg object-cover"
                  unoptimized
                />
              </div>
            )}
          </div>

          {/* Account Type (Read-only) */}
          <div className="space-y-2">
            <Label className="ml-1">Account Type</Label>
            <InputGroup>
              <Input
                type="text"
                value={profile?.accountType || ""}
                disabled
                className="border-0 shadow-none focus-visible:ring-0 bg-muted/50 capitalize"
              />
            </InputGroup>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <p className="text-sm text-emerald-600 dark:text-emerald-400">
                Profile updated successfully
              </p>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={saving}
            className="w-full bg-primary hover:bg-primary/90"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>

          {/* Member Since */}
          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Member since{" "}
              {new Date(profile?.createdAt || "").toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

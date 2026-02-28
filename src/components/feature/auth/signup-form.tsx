"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupText } from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { GoogleIcon } from "@/components/icons/google-icon";
import { Mail, Lock, Loader2, Eye, EyeOff } from "lucide-react";
import { AccountTypeSelector } from "./account-type-selector";

type AccountType = "candidate" | "recruiter";

export function SignUpForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [accountType, setAccountType] = useState<AccountType>("candidate");
  const { signUp, signInWithGoogle, loading, error } = useAuth();

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await signUp(email, password, accountType);
      setEmail("");
      setPassword("");
    } catch (err) {
      console.error(err);
    }
  };

  console.log(accountType);

  return (
    <Card className="border-border">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <AccountTypeSelector value={accountType} onChange={setAccountType} disabled={loading} />

          <div className="space-y-2.5">
            <Label>Email Address</Label>
            <InputGroup>
              <InputGroupText>
                <Mail className="h-4 w-4" />
              </InputGroupText>
              <Input
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-0 shadow-none focus-visible:ring-0"
                disabled={loading}
              />
            </InputGroup>
          </div>

          <div className="space-y-2.5">
            <Label>Password</Label>
            <InputGroup>
              <InputGroupText>
                <Lock className="h-4 w-4" />
              </InputGroupText>
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-0 shadow-none focus-visible:ring-0"
                disabled={loading}
              />
              <Button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                variant="ghost"
                size="icon-xs"
                className="border-0 bg-transparent shadow-none hover:bg-transparent"
                disabled={loading}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </InputGroup>
          </div>

          {error && (
            <div className="border-destructive/30 bg-destructive/5 text-destructive rounded-lg border px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Sign Up"
            )}
          </Button>

          <div className="relative py-1">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-card text-muted-foreground px-3 text-xs">Or continue with</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full gap-2"
            size="lg"
            disabled={loading}
            onClick={() => signInWithGoogle(accountType)}
          >
            <GoogleIcon />
            Continue with Google
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

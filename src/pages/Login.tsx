import React, { useState } from "react";
import { supabase } from "../config/supabaseClient";
import { useNavigate } from "react-router-dom";
// IMPORT USER SERVICE HERE
import { userService } from "../services/api";
import { toast } from "sonner";

// SHADCN UI
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BookOpen, User, Phone } from "lucide-react";

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();

  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState("Faculty");

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        // 1. Validate extra fields
        if (!fullName || !phone) {
          toast.error("Please fill in all fields");
          setLoading(false);
          return;
        }

        // 2. Create User in Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp(
          {
            email,
            password,
            // If you disabled email confirmation in Supabase, this logs them in immediately
          }
        );

        if (authError) throw authError;

        if (authData.user) {
          // 3. Update the Profile row
          // We wait a tiny bit to ensure the database trigger has finished creating the row
          await new Promise((r) => setTimeout(r, 1000));

          try {
            await userService.updateProfile(authData.user.id, {
              full_name: fullName,
              phone,
              department,
            });
            toast.success("Account created successfully!");
            // If email confirmation is off, we can redirect directly
            navigate("/book");
          } catch (profileError) {
            console.error("Profile update failed", profileError);
            // Even if profile fails, the user is created, so just let them know
            toast.warning("Account created, but could not save details.");
          }
        } else {
          toast.info("Check your email for the confirmation link.");
        }
      } else {
        // LOGIN FLOW
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        toast.success("Welcome back!");
        navigate("/book");
      }
    } catch (error: any) {
      toast.error(error.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors p-4">
      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-primary">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-2">
            <BookOpen className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">
            {isSignUp ? "Join CajuHub" : "Welcome Back"}
          </CardTitle>
          <CardDescription>
            {isSignUp
              ? "Create your employee profile"
              : "Sign in to manage bookings"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            {/* EXTRA FIELDS FOR SIGN UP */}
            {isSignUp && (
              <div className="space-y-3 animate-in slide-in-from-top-4 duration-300">
                <div className="space-y-1">
                  <Label>Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="e.g. John Doe"
                      className="pl-8"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label>Phone</Label>
                    <div className="relative">
                      <Phone className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="(11) 99999-9999"
                        className="pl-8"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label>Department</Label>
                    <Select value={department} onValueChange={setDepartment}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Faculty">
                          Faculty (Professors)
                        </SelectItem>
                        <SelectItem value="IT">IT Support</SelectItem>
                        <SelectItem value="Admin">Administration</SelectItem>
                        <SelectItem value="HR">Human Resources</SelectItem>
                        <SelectItem value="Student">Student Body</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* STANDARD FIELDS */}
            <div className="space-y-1">
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="you@school.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <Label>Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button className="w-full mt-2" type="submit" disabled={loading}>
              {loading
                ? "Processing..."
                : isSignUp
                ? "Create Account"
                : "Sign In"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="link" onClick={() => setIsSignUp(!isSignUp)}>
            {isSignUp
              ? "Already have an account? Sign In"
              : "Need an account? Sign Up"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;

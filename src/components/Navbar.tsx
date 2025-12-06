import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ModeToggle } from "./mode-toggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, Calendar, Map, User, Settings } from "lucide-react";

export function Navbar() {
  const { user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  // If no user, we generally don't show the main nav (or show a simplified one)
  if (!user) return null;

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-6">
        {/* LOGO */}
        <div className="mr-4 hidden md:flex">
          <Link to="/book" className="mr-6 flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block text-xl">
              CAJU<span className="text-primary">HUB</span>
            </span>
          </Link>

          {/* MAIN LINKS */}
          <nav className="flex items-center space-x-4 text-sm font-medium">
            <Link to="/book">
              <Button variant="ghost" className="flex gap-2">
                <Map className="h-4 w-4" />
                Book a Room
              </Button>
            </Link>

            <Link to="/my-bookings">
              <Button variant="ghost" className="flex gap-2">
                <Calendar className="h-4 w-4" />
                My Bookings
              </Button>
            </Link>

            {isAdmin && (
              <>
                <Link to="/admin">
                  <Button variant="ghost">Editor</Button>
                </Link>
                <Link to="/admin/bookings">
                  <Button variant="ghost">Dashboard</Button>
                </Link>
              </>
            )}
          </nav>
        </div>

        {/* RIGHT SIDE (User & Theme) */}
        <div className="ml-auto flex items-center space-x-4">
          <ModeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-9 w-9">
                  {/* We don't have user images yet, so we use fallback initials */}
                  <AvatarImage src="" alt={user.email || ""} />
                  <AvatarFallback>
                    {user.email?.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">User</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/my-bookings")}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-red-600 focus:text-red-600"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}

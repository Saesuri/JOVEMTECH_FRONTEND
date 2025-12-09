import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { ModeToggle } from "./mode-toggle";
import { LanguageSwitcher } from "./LanguageSwitcher";
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
import {
  LogOut,
  Calendar,
  Map,
  User,
  Menu,
  Settings,
  LayoutDashboard,
  Pencil,
} from "lucide-react";

export function Navbar() {
  const { t } = useTranslation();
  const { user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  // If no user, we generally don't show the main nav (or show a simplified one)
  if (!user) return null;

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="flex h-16 items-center px-4 md:px-6">
        {/* MOBILE MENU */}
        <div className="md:hidden mr-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel className="font-bold">
                CAJU<span className="text-primary">HUB</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/book")}>
                <Map className="mr-2 h-4 w-4" />
                {t("nav.bookRoom")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/my-bookings")}>
                <Calendar className="mr-2 h-4 w-4" />
                {t("nav.myBookings")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/profile")}>
                <User className="mr-2 h-4 w-4" />
                {t("nav.profile")}
              </DropdownMenuItem>
              {isAdmin && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-xs text-muted-foreground">
                    Admin
                  </DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => navigate("/admin")}>
                    <Pencil className="mr-2 h-4 w-4" />
                    {t("nav.editor")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/admin/bookings")}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    {t("nav.dashboard")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/admin/settings")}>
                    <Settings className="mr-2 h-4 w-4" />
                    {t("nav.config")}
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* MOBILE LOGO */}
        <Link to="/book" className="md:hidden flex items-center">
          <span className="font-bold text-lg">
            CAJU<span className="text-primary">HUB</span>
          </span>
        </Link>

        {/* DESKTOP LOGO & LINKS */}
        <div className="mr-4 hidden md:flex">
          <Link to="/book" className="mr-6 flex items-center space-x-2">
            <span className="font-bold text-xl">
              CAJU<span className="text-primary">HUB</span>
            </span>
          </Link>

          {/* MAIN LINKS */}
          <nav className="flex items-center space-x-4 text-sm font-medium">
            <Link to="/book">
              <Button variant="ghost" className="flex gap-2">
                <Map className="h-4 w-4" />
                {t("nav.bookRoom")}
              </Button>
            </Link>

            <Link to="/my-bookings">
              <Button variant="ghost" className="flex gap-2">
                <Calendar className="h-4 w-4" />
                {t("nav.myBookings")}
              </Button>
            </Link>

            {isAdmin && (
              <div className="flex items-center space-x-2 border-l pl-4 ml-2">
                <Link to="/admin">
                  <Button variant="ghost" size="sm">
                    {t("nav.editor")}
                  </Button>
                </Link>
                <Link to="/admin/bookings">
                  <Button variant="ghost" size="sm">
                    {t("nav.dashboard")}
                  </Button>
                </Link>
                <Link to="/admin/settings">
                  <Button variant="ghost" size="sm">
                    {t("nav.config")}
                  </Button>
                </Link>
              </div>
            )}
          </nav>
        </div>

        {/* RIGHT SIDE (User, Language & Theme) */}
        <div className="ml-auto flex items-center space-x-2 md:space-x-4">
          <LanguageSwitcher />
          <ModeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8 md:h-9 md:w-9">
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
                  <p className="text-sm font-medium leading-none">
                    {t("common.table.user")}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/profile")}>
                <User className="mr-2 h-4 w-4" />
                <span>{t("nav.profile")}</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-red-600 focus:text-red-600"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>{t("nav.logout")}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}

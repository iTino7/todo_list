import * as React from "react";
import { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "./ui/sidebar";
import { Home as HomeIcon, ListTodo, Plus, Menu, Sun, Sunset, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

function MenuButtonWithExpand({
  tooltip,
  children,
  className,
  isActive = false,
  count,
  ...props
}: React.ComponentProps<typeof SidebarMenuButton> & {
  isActive?: boolean;
  count?: number;
}) {
  const { state, setOpen } = useSidebar();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (state === "collapsed") {
      setOpen(true);
    }
    props.onClick?.(e);
  };

  return (
    <SidebarMenuButton 
      tooltip={tooltip} 
      onClick={handleClick}
      isActive={isActive}
      className={cn(
        "border-0! hover:border-0! active:border-0! focus-visible:border-0! ring-0! hover:ring-0! active:ring-0! focus-visible:ring-0! outline-none! shadow-none!",
        "py-5! px-3! bg-transparent! hover:bg-zinc-200 active:bg-zinc-200 focus-visible:bg-transparent!",
        isActive && "bg-zinc-200! hover:bg-zinc-200!",
        className
      )}
      {...props}
    >
      {children}
      {count !== undefined && (
        <span className={cn(
          "ml-auto mr-2 bg-zinc-200 text-xs font-medium rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5",
          isActive && "bg-sidebar"
        )}>
          {count}
        </span>
      )}
    </SidebarMenuButton>
  );
}

function Home() {
  const [activeItem, setActiveItem] = useState<"home" | "new-list">("home");

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 13) {
      return { text: "Buongiorno", icon: Sun };
    } else if (hour >= 13 && hour < 18) {
      return { text: "Buon pomeriggio", icon: Sunset };
    } else {
      return { text: "Buona sera", icon: Moon };
    }
  };

  const greeting = getGreeting();
  const GreetingIcon = greeting.icon;

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <div className="flex items-center gap-2 px-2 py-2">
            <ListTodo className="size-6" />
            <span className="font-semibold text-lg group-data-[collapsible=icon]:hidden">
              Todo List
            </span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu className="group-data-[collapsible=icon]:items-center mt-4">
            <SidebarMenuItem className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
              <MenuButtonWithExpand 
                tooltip="Home" 
                isActive={activeItem === "home"}
                onClick={() => setActiveItem("home")}
                count={1}
              >
                <HomeIcon />
                <span>Home</span>
              </MenuButtonWithExpand>
            </SidebarMenuItem>
            <SidebarMenuItem className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
              <MenuButtonWithExpand 
                tooltip="Crea una nuova lista" 
                isActive={activeItem === "new-list"}
                onClick={() => setActiveItem("new-list")}
              >
                <Plus />
                <span>Crea una nuova lista</span>
              </MenuButtonWithExpand>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <div className="px-2 py-2 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
            Versione 1.0.0
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="bg-transparent! hover:bg-transparent! active:bg-transparent! focus-visible:bg-transparent! border-0! hover:border-0! active:border-0! focus-visible:border-0! ring-0! hover:ring-0! active:ring-0! focus-visible:ring-0! outline-none!">
            <Menu className="h-5 w-5" />
          </SidebarTrigger>
          <div className="flex-1" />
        </header>
        <div className="flex flex-1 flex-col p-4">
          <div className="pt-8 text-center">
            <div className="flex items-center justify-center gap-3">
              <GreetingIcon className="size-6" />
              <h1 className="text-xl font-extralight">
                {greeting.text}, Tino
              </h1>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default Home;


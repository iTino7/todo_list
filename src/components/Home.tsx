import * as React from "react";
import { useState, useRef } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "./ui/sidebar";
import { Home as HomeIcon, Plus, Sun, CloudSun, Moon, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import SplitText from "./SplitText";
import { Calendar, CalendarDayButton } from "./ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { ComboboxDemo } from "./ui/combox";

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

function ToggleSidebarButton() {
  const { open, setOpen } = useSidebar();

  const handleClick = () => {
    setOpen(!open);
  };

  return (
    <div 
      className="absolute right-0 top-8 -translate-y-1/2 translate-x-1/2 z-20 cursor-pointer"
      onClick={handleClick}
    >
      <div className="bg-white rounded-full p-2 shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors">
        <Maximize2 className="size-4 text-gray-700" />
      </div>
    </div>
  );
}

function Home() {
  const [activeItem, setActiveItem] = useState<"home" | "new-list">("home");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [lists] = useState([
    { value: "lista1", label: "Lista 1" },
    { value: "lista2", label: "Lista 2" },
    { value: "lista3", label: "Lista 3" },
  ]);
  // Inizializza con la data odierna
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });
  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });
  const [showHours, setShowHours] = useState(false);
  const lastClickedDateRef = useRef<Date | null>(null);
  const clickTimeoutRef = useRef<number | null>(null);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      // Normalizza le date per il confronto (solo giorno, mese, anno)
      const normalizeDate = (d: Date) => {
        const normalized = new Date(d);
        normalized.setHours(0, 0, 0, 0);
        return normalized;
      };
      
      const normalizedDate = normalizeDate(date);
      const normalizedLast = lastClickedDateRef.current ? normalizeDate(lastClickedDateRef.current) : null;
      
      // Controlla se è un doppio click sulla stessa data
      if (normalizedLast && normalizedLast.getTime() === normalizedDate.getTime()) {
        // Doppio click - mostra le ore
        if (clickTimeoutRef.current) {
          clearTimeout(clickTimeoutRef.current);
          clickTimeoutRef.current = null;
        }
        setShowHours(true);
        lastClickedDateRef.current = null;
        return; // Non aggiornare selectedDate
      } else {
        // Primo click - seleziona la data
        setSelectedDate(date);
        setShowHours(false);
        lastClickedDateRef.current = date;
        
        // Reset del timeout dopo un certo tempo
        if (clickTimeoutRef.current) {
          clearTimeout(clickTimeoutRef.current);
        }
        clickTimeoutRef.current = setTimeout(() => {
          lastClickedDateRef.current = null;
        }, 300); // 300ms per considerare un doppio click
      }
    } else {
      setSelectedDate(date);
      setShowHours(false);
      lastClickedDateRef.current = null;
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
        clickTimeoutRef.current = null;
      }
    }
  };

  const handleBackToCalendar = () => {
    setShowHours(false);
  };

  const generateHours = () => {
    const hours = [];
    for (let i = 0; i < 24; i++) {
      hours.push(i.toString().padStart(2, '0') + ':00');
    }
    return hours;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 13) {
      return { text: "Buongiorno", icon: Sun };
    } else if (hour >= 13 && hour < 18) {
      return { text: "Buon pomeriggio", icon: CloudSun };
    } else {
      return { text: "Buona sera", icon: Moon };
    }
  };

  const greeting = getGreeting();
  const GreetingIcon = greeting.icon;

  const getFormattedDate = () => {
    const today = new Date();
    const days = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
    const months = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];
    
    const dayName = days[today.getDay()];
    const day = today.getDate();
    const month = months[today.getMonth()];
    const year = today.getFullYear();
    
    return `Oggi, ${dayName} ${day} ${month} ${year}`;
  };

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" className="relative">
        <ToggleSidebarButton />
        <SidebarHeader className="py-6">
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
        <header className="flex h-auto shrink-0 items-center gap-2 pl-12 pr-4 py-4">
          <div className="flex flex-col gap-1">
            <SplitText
              text={`${greeting.text}, Tino`}
              tag="h1"
              className="text-2xl! font-extralight"
              textAlign="left"
              animateOnce={true}
              animationKey="greeting-animated"
            >
              <GreetingIcon className="size-5" />
            </SplitText>
            <p className="text-sm text-muted-foreground ml-1">
              {getFormattedDate()}
            </p>
          </div>
          <div className="flex-1" />
        </header>
        <div className="flex flex-1 flex-col p-4">
          <div className="flex justify-center mt-auto pb-8">
              <button 
                onClick={() => setIsCalendarOpen(true)}
                className="bg-black! text-white px-28! py-3 rounded-3xl! border-0! hover:border-0! flex items-center gap-2 font-medium"
              >
              <Plus className="size-5" />
              <span>Create new task</span>
            </button>
          </div>
        </div>
      </SidebarInset>
      <Dialog open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center">
              {showHours ? "Seleziona un'ora" : "Seleziona una data"}
            </DialogTitle>
          </DialogHeader>
          <div className="flex justify-center mt-8 relative min-h-[400px]">
            {showHours ? (
              <div className="w-full animate-in fade-in duration-300">
                <div className="w-full max-w-md mx-auto">
                  <div className="w-full mb-4">
                    <ComboboxDemo items={lists} />
                  </div>
                  <div className="flex items-center mb-4">
                    <button
                      onClick={handleBackToCalendar}
                      className="text-sm text-muted-foreground transition-colors border border-transparent"
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = '#000000'}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
                    >
Torna al calendario
                    </button>
                    {selectedDate && (
                      <div className="ml-auto text-sm font-medium">
                        {selectedDate.toLocaleDateString('it-IT', { 
                          weekday: 'short', 
                          day: 'numeric', 
                          month: 'short', 
                          year: 'numeric' 
                        })}
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-6 gap-2 w-full">
                    {generateHours().map((hour, index) => (
                      <button
                        key={index}
                        className="aspect-square flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-all active:scale-95 text-sm font-medium"
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = '#000000'}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = ''}
                        onClick={() => {
                          // Qui puoi gestire la selezione dell'ora
                          console.log(`Selected hour: ${hour} for date: ${selectedDate}`);
                        }}
                      >
                        {hour}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="animate-in fade-in duration-300">
                <Calendar 
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  month={currentMonth}
                  onMonthChange={setCurrentMonth}
                  disabled={(date) => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    // Disabilita date passate
                    if (date < today) return true;
                    // Disabilita date fuori dal mese visualizzato
                    const dateMonth = date.getMonth();
                    const dateYear = date.getFullYear();
                    const currentMonthValue = currentMonth.getMonth();
                    const currentYear = currentMonth.getFullYear();
                    return dateMonth !== currentMonthValue || dateYear !== currentYear;
                  }}
                  components={{
                    DayButton: ({ day, modifiers, ...props }) => {
                      const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
                        // Se la data è già selezionata e clicchi di nuovo, mostra le ore
                        if (modifiers.selected && selectedDate) {
                          const normalizeDate = (d: Date) => {
                            const normalized = new Date(d);
                            normalized.setHours(0, 0, 0, 0);
                            return normalized;
                          };
                          
                          const normalizedDay = normalizeDate(day.date);
                          const normalizedSelected = normalizeDate(selectedDate);
                          
                          if (normalizedDay.getTime() === normalizedSelected.getTime()) {
                            e.preventDefault();
                            setShowHours(true);
                            return;
                          }
                        }
                        // Altrimenti, chiama l'handler normale
                        props.onClick?.(e);
                      };
                      
                      return (
                        <CalendarDayButton
                          day={day}
                          modifiers={modifiers}
                          {...props}
                          onClick={handleClick}
                          onDoubleClick={(e) => {
                            e.preventDefault();
                            if (modifiers.selected && selectedDate) {
                              setShowHours(true);
                            }
                          }}
                        />
                      );
                    }
                  }}
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}

export default Home;


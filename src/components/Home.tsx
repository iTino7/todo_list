import * as React from "react";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
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
import { Plus, Sun, CloudSun, Moon, Maximize2, Trash2, ArrowLeft, X, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import SplitText from "./SplitText";
import BlurText from "./BlurText";
import TextType from "./TextType";
import { Calendar, CalendarDayButton } from "./ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogDescription, DialogFooter } from "./ui/dialog";
import { ComboboxDemo } from "./ui/combox";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import EmojiPicker from "emoji-picker-react";
import { toast } from "sonner";

// Utility functions
const normalizeDate = (d: Date): Date => {
  const normalized = new Date(d);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
};

const generateHours = (): string[] => {
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

const getFormattedDate = (): string => {
  const today = new Date();
  const days = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
  const months = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];
  
  const dayName = days[today.getDay()];
  const day = today.getDate();
  const month = months[today.getMonth()];
  const year = today.getFullYear();
  
  return `Oggi, ${dayName} ${day} ${month} ${year}`;
};

const formatTaskDate = (dateString: string): string => {
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const taskDate = new Date(date);
  taskDate.setHours(0, 0, 0, 0);
  
  const days = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
  const months = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];
  
  const dayName = days[taskDate.getDay()];
  const day = taskDate.getDate();
  const month = months[taskDate.getMonth()];
  const year = taskDate.getFullYear();
  
  // Se è oggi
  if (taskDate.getTime() === today.getTime()) {
    return 'Oggi';
  }
  
  // Se è domani
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (taskDate.getTime() === tomorrow.getTime()) {
    return `Domani, ${dayName} ${day} ${month}${year !== today.getFullYear() ? ` ${year}` : ''}`;
  }
  
  // Altrimenti mostra la data completa
  return `${dayName}, ${day} ${month}${year !== today.getFullYear() ? ` ${year}` : ''}`;
};

// Handler functions
const createHandleBackToCalendar = (
  setShowHours: React.Dispatch<React.SetStateAction<boolean>>
) => {
  return () => {
    setShowHours(false);
  };
};

const createHandleDialogOpenChange = (
  setIsCalendarOpen: React.Dispatch<React.SetStateAction<boolean>>,
  setShowHours: React.Dispatch<React.SetStateAction<boolean>>
) => {
  return (open: boolean) => {
    setIsCalendarOpen(open);
    if (!open) {
      // Quando il dialog viene chiuso, resetta alla vista iniziale
      setShowHours(false);
    }
  };
};

const createHandleSaveList = (
  listName: string,
  setLists: React.Dispatch<React.SetStateAction<Array<{ value: string; label: string }>>>,
  lists: Array<{ value: string; label: string }>,
  setIsNewListDialogOpen: React.Dispatch<React.SetStateAction<boolean>>,
  setListName: React.Dispatch<React.SetStateAction<string>>
) => {
  return () => {
    if (listName.trim().length > 0) {
      // Crea un nuovo ID univoco per la lista
      const newListId = `lista-${Date.now()}`;
      const newList = { 
        value: newListId, 
        label: listName.trim() 
      };
      // Aggiungi la nuova lista all'array
      const updatedLists = [...lists, newList];
      setLists(updatedLists);
      // Salva in localStorage
      localStorage.setItem('todo-lists', JSON.stringify(updatedLists));
      // Chiudi il dialog e resetta il nome
      setIsNewListDialogOpen(false);
      setListName("");
    }
  };
};

const createHandleDeleteList = (
  selectedListId: string | null,
  lists: Array<{ value: string; label: string }>,
  setLists: React.Dispatch<React.SetStateAction<Array<{ value: string; label: string }>>>,
  setSelectedListId: React.Dispatch<React.SetStateAction<string | null>>,
  setActiveItem: React.Dispatch<React.SetStateAction<string>>
) => {
  return () => {
    if (selectedListId) {
      const updatedLists = lists.filter(list => list.value !== selectedListId);
      setLists(updatedLists);
      // Salva in localStorage
      localStorage.setItem('todo-lists', JSON.stringify(updatedLists));
      // Resetta la selezione
      setSelectedListId(null);
      setActiveItem("");
    }
  };
};

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
  const [showWelcome, setShowWelcome] = useState(true);
  const [showNameInput, setShowNameInput] = useState(false);
  const [userName, setUserName] = useState("");
  const [activeItem, setActiveItem] = useState<string>("");
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isNewListDialogOpen, setIsNewListDialogOpen] = useState(false);
  const [isDeleteListDialogOpen, setIsDeleteListDialogOpen] = useState(false);
  const [isDeleteTaskDialogOpen, setIsDeleteTaskDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [listName, setListName] = useState("");
  const [lists, setLists] = useState<Array<{ value: string; label: string }>>(() => {
    // Carica le liste da localStorage al caricamento
    const savedLists = localStorage.getItem('todo-lists');
    return savedLists ? JSON.parse(savedLists) : [];
  });
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
  const [selectedHours, setSelectedHours] = useState<string[]>([]);
  const [taskDescription, setTaskDescription] = useState("");
  const [selectedListForTask, setSelectedListForTask] = useState<string>("");
  const [tasks, setTasks] = useState<Array<{
    id: string;
    description: string;
    date: string;
    hours: string[];
    listId: string;
    completed?: boolean;
  }>>(() => {
    // Carica le task da localStorage al caricamento
    const savedTasks = localStorage.getItem('todo-tasks');
    return savedTasks ? JSON.parse(savedTasks) : [];
  });
  const lastClickedDateRef = useRef<Date | null>(null);
  const clickTimeoutRef = useRef<number | null>(null);

  // Create handlers using external functions
  // Create handleDateSelect inline to avoid ref access during render warning
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
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

  const handleBackToCalendar = createHandleBackToCalendar(setShowHours);

  const handleDialogOpenChange = createHandleDialogOpenChange(
    setIsCalendarOpen,
    setShowHours
  );

  const handleSaveList = createHandleSaveList(
    listName,
    setLists,
    lists,
    setIsNewListDialogOpen,
    setListName
  );

  const handleDeleteList = createHandleDeleteList(
    selectedListId,
    lists,
    setLists,
    setSelectedListId,
    setActiveItem
  );

  const handleSaveTask = () => {
    if (taskDescription.trim().length > 0 && selectedListForTask && selectedDate) {
      // Crea un nuovo ID univoco per la task
      const newTaskId = `task-${Date.now()}`;
      const newTask = {
        id: newTaskId,
        description: taskDescription.trim(),
        date: selectedDate.toISOString(),
        hours: selectedHours,
        listId: selectedListForTask,
        completed: false
      };
      
      // Aggiungi la nuova task
      const updatedTasks = [...tasks, newTask];
      setTasks(updatedTasks);
      
      // Salva in localStorage
      localStorage.setItem('todo-tasks', JSON.stringify(updatedTasks));
      
      // Reset dei campi e chiudi il dialog
      setTaskDescription("");
      setSelectedHours([]);
      setSelectedListForTask("");
      setIsCalendarOpen(false);
      setShowHours(false);
    }
  };

  // Filtra le task per la lista selezionata
  const tasksForSelectedList = selectedListId 
    ? tasks.filter(task => task.listId === selectedListId)
    : [];

  // Raggruppa le task per giorno
  const tasksByDate = tasksForSelectedList.reduce((acc, task) => {
    const taskDate = new Date(task.date);
    taskDate.setHours(0, 0, 0, 0);
    const dateKey = taskDate.toISOString();
    
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(task);
    return acc;
  }, {} as Record<string, typeof tasksForSelectedList>);

  // Ordina le date (oggi prima, poi cronologicamente)
  const sortedDates = Object.keys(tasksByDate).sort((a, b) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateA = new Date(a);
    const dateB = new Date(b);
    
    // Se una è oggi, mettila prima
    if (dateA.getTime() === today.getTime()) return -1;
    if (dateB.getTime() === today.getTime()) return 1;
    
    // Altrimenti ordina cronologicamente
    return dateA.getTime() - dateB.getTime();
  });

  const [animatingTasks, setAnimatingTasks] = useState<Map<string, 'in' | 'out'>>(new Map());

  const handleToggleTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    const newCompleted = !task?.completed;
    
    // Se si sta attivando (entrata)
    if (newCompleted) {
      setAnimatingTasks(prev => new Map(prev).set(taskId, 'in'));
      const updatedTasks = tasks.map(t => 
        t.id === taskId 
          ? { ...t, completed: true }
          : t
      );
      setTasks(updatedTasks);
      localStorage.setItem('todo-tasks', JSON.stringify(updatedTasks));
      setTimeout(() => {
        setAnimatingTasks(prev => {
          const newMap = new Map(prev);
          newMap.delete(taskId);
          return newMap;
        });
      }, 300);
    } else {
      // Se si sta disattivando (uscita)
      setAnimatingTasks(prev => new Map(prev).set(taskId, 'out'));
      setTimeout(() => {
        const updatedTasks = tasks.map(t => 
          t.id === taskId 
            ? { ...t, completed: false }
            : t
        );
        setTasks(updatedTasks);
        localStorage.setItem('todo-tasks', JSON.stringify(updatedTasks));
        setAnimatingTasks(prev => {
          const newMap = new Map(prev);
          newMap.delete(taskId);
          return newMap;
        });
      }, 300);
    }
  };

  const handleDeleteTask = () => {
    if (taskToDelete) {
      const updatedTasks = tasks.filter(t => t.id !== taskToDelete);
      setTasks(updatedTasks);
      localStorage.setItem('todo-tasks', JSON.stringify(updatedTasks));
      setTaskToDelete(null);
    }
  };

  const greeting = getGreeting();
  const GreetingIcon = greeting.icon;

  const handleBlurTextComplete = () => {
    // Aspetta 1.5 secondi dopo che l'animazione è completa prima di nascondere
    setTimeout(() => {
      setShowWelcome(false);
      setShowNameInput(true);
    }, 1500);
  };

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userName.trim().length > 0) {
      setShowNameInput(false);
    }
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {showWelcome ? (
          <motion.div
            key="welcome"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="flex items-center justify-center min-h-screen w-full fixed inset-0 bg-background z-50"
          >
            <BlurText
              text="Benvenuto"
              className="text-6xl font-extralight"
              animateBy="words"
              direction="top"
              onAnimationComplete={handleBlurTextComplete}
            />
          </motion.div>
        ) : showNameInput ? (
          <motion.div
            key="name-input"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="flex flex-col items-center justify-center min-h-screen w-full fixed inset-0 bg-background z-50 gap-8"
          >
            <TextType
              text="Scrivi il tuo nome"
              className="text-4xl font-extralight"
              typingSpeed={50}
              loop={false}
              showCursor={true}
            />
            <form onSubmit={handleNameSubmit} className="flex flex-col items-center gap-4 w-full max-w-md px-4">
              <Input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Il tuo nome"
                className="text-center text-lg py-6"
                autoFocus
              />
              <Button
                type="submit"
                disabled={userName.trim().length === 0}
                className="bg-black! text-white px-8! py-3 rounded-3xl! border-0! hover:border-0! font-medium disabled:bg-gray-300! disabled:text-gray-500! disabled:cursor-not-allowed"
              >
                Continua
              </Button>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="todo-list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="w-full"
          >
            <SidebarProvider>
      <Sidebar collapsible="icon" className="relative">
        <ToggleSidebarButton />
        <SidebarHeader className="py-6">
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu className="group-data-[collapsible=icon]:items-center mt-4">
            {lists.map((list) => (
              <SidebarMenuItem key={list.value} className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
                <MenuButtonWithExpand 
                  tooltip={list.label}
                  isActive={activeItem === list.value}
                  onClick={() => {
                    setActiveItem(list.value);
                    setSelectedListId(list.value);
                  }}
                >
                  <span>{list.label}</span>
                </MenuButtonWithExpand>
              </SidebarMenuItem>
            ))}
            <SidebarMenuItem className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
              <MenuButtonWithExpand 
                tooltip="Crea una nuova lista" 
                isActive={activeItem === "new-list"}
                onClick={() => setIsNewListDialogOpen(true)}
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
              text={`${greeting.text}, ${userName || 'Tino'}`}
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
            {selectedListId && (
              <h2 className="text-lg font-extralight mt-2">
                {lists.find(l => l.value === selectedListId)?.label || 'Lista'}
              </h2>
            )}
          </div>
          <div className="flex-1" />
        </header>
        <div className="flex flex-1 flex-col p-4 relative">
          {selectedListId && (
            <>
              {tasksForSelectedList.length > 0 ? (
                <div className="flex flex-1 flex-col gap-2 overflow-y-auto max-w-2xl mx-auto w-full">
                  {sortedDates.map((dateKey) => {
                    const dateTasks = tasksByDate[dateKey];
                    
                    return (
                      <div key={dateKey} className="flex flex-col gap-2">
                        <div className="text-xs text-muted-foreground font-medium mt-2 mb-1 px-1">
                          {formatTaskDate(dateKey)}
                        </div>
                        {dateTasks.map((task) => {
                          return (
                            <div key={task.id} className="flex items-center gap-2 p-2.5 bg-white rounded-lg">
                              <input
                                type="checkbox"
                                checked={task.completed || false}
                                onChange={() => handleToggleTask(task.id)}
                                className="w-4 h-4 rounded border-gray-300 text-black focus:ring-0 cursor-pointer"
                              />
                              <div className="flex-1 flex items-center gap-2">
                                <span className="text-sm font-medium relative inline-block">
                                  {task.description}
                                  {(task.completed || animatingTasks.has(task.id)) && (
                                    <div 
                                      className={`absolute top-1/2 h-px bg-current opacity-60 ${
                                        animatingTasks.get(task.id) === 'out'
                                          ? 'right-0 animate-[strike-out_0.3s_ease-in-out_forwards]'
                                          : 'left-0 animate-[strike-in_0.3s_ease-in-out_forwards]'
                                      }`}
                                      style={{ width: task.completed && !animatingTasks.has(task.id) ? '100%' : undefined }}
                                    />
                                  )}
                                </span>
                              </div>
                              {task.hours && task.hours.length > 0 && (
                                <div className="flex items-center gap-0 text-xs text-muted-foreground">
                                  <Clock className="size-3 mr-1" />
                                  <span>{task.hours.length === 2 ? `${task.hours[0]} - ${task.hours[1]}` : task.hours[0]}</span>
                                </div>
                              )}
                              <button 
                                onClick={() => {
                                  setTaskToDelete(task.id);
                                  setIsDeleteTaskDialogOpen(true);
                                }}
                                className="p-1 bg-transparent! border-0! hover:bg-transparent! focus:bg-transparent! active:bg-transparent! outline-none! shadow-none! cursor-pointer"
                              >
                                <Trash2 className="size-4 text-destructive" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-1 items-center justify-center">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Contenuto della lista</p>
                  </div>
                </div>
              )}
              <button
                onClick={() => setIsDeleteListDialogOpen(true)}
                className="absolute bottom-8 left-4 p-2 text-destructive border-0! hover:border-0! focus-visible:border-0! active:border-0! outline-none! ring-0! hover:ring-0! focus-visible:ring-0! shadow-none!"
                title="Elimina lista"
              >
                <Trash2 className="size-4" />
              </button>
            </>
          )}
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
      <Dialog open={isCalendarOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              {showHours ? (
                <>
                  <button
                    onClick={handleBackToCalendar}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <ArrowLeft className="size-5" />
                  </button>
                  <span className="flex-1 text-center">Seleziona un'ora</span>
                  <DialogClose className="p-1 hover:bg-gray-100 rounded-full transition-colors opacity-70 hover:opacity-100">
                    <X className="size-5" />
                    <span className="sr-only">Close</span>
                  </DialogClose>
                </>
              ) : (
                <>
                  <div className="flex-1 text-center">Seleziona una data</div>
                  <DialogClose className="p-1 hover:bg-gray-100 rounded-full transition-colors opacity-70 hover:opacity-100">
                    <X className="size-5" />
                    <span className="sr-only">Close</span>
                  </DialogClose>
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="flex justify-center mt-8 relative min-h-[400px]">
            {showHours ? (
              <div className="w-full animate-in fade-in duration-300">
                <div className="w-full max-w-lg mx-auto">
                  {selectedDate && (
                    <div className="w-full mb-4 relative">
                      <Input
                        className="w-full pr-32 py-2 text-sm"
                        placeholder="Aggiungi una task"
                        style={{ backgroundColor: '#e8e8e8', border: 'none' }}
                        value={taskDescription}
                        onChange={(e) => setTaskDescription(e.target.value)}
                      />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                        <span className={`text-xs font-medium text-muted-foreground bg-white rounded-full px-2 py-0.5 transition-all duration-700 ${selectedHours.length > 0 ? 'animate-in slide-in-from-right-2' : ''}`}>
                          {selectedDate.toLocaleDateString('it-IT', { 
                            day: 'numeric', 
                            month: 'short',
                            ...(selectedDate.getFullYear() > new Date().getFullYear() && { year: 'numeric' })
                          })}
                        </span>
                        {selectedHours.length === 2 ? (
                          <span className="text-xs font-medium text-muted-foreground bg-white rounded-full px-2 py-0.5 animate-in slide-in-from-left-2 fade-in duration-700">
                            {selectedHours[0]} - {selectedHours[1]}
                          </span>
                        ) : (
                          selectedHours.map((hour, index) => (
                            <span key={index} className="text-xs font-medium text-muted-foreground bg-white rounded-full px-2 py-0.5 animate-in slide-in-from-left-2 fade-in duration-700">
                              {hour}
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                  <div className="w-full mb-4">
                    <ComboboxDemo 
                      items={lists} 
                      value={selectedListForTask}
                      onValueChange={setSelectedListForTask}
                    />
                  </div>
                  <div className="grid grid-cols-6 gap-2 w-full mb-6">
                    {generateHours().map((hour, index) => (
                      <button
                        key={index}
                        className={`aspect-square flex items-center justify-center rounded-md border transition-all active:scale-95 text-sm font-medium ${
                          selectedHours.includes(hour)
                            ? 'border-black bg-background text-foreground'
                            : 'border-input bg-background hover:bg-accent hover:text-accent-foreground'
                        }`}
                        onMouseEnter={(e) => {
                          if (!selectedHours.includes(hour)) {
                            e.currentTarget.style.borderColor = '#000000';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!selectedHours.includes(hour)) {
                            e.currentTarget.style.borderColor = '';
                          }
                        }}
                        onClick={() => {
                          if (selectedHours.includes(hour)) {
                            // Se l'orario è già selezionato, rimuovilo
                            setSelectedHours(selectedHours.filter(h => h !== hour));
                          } else if (selectedHours.length < 2) {
                            // Se ci sono meno di 2 orari, aggiungilo
                            setSelectedHours([...selectedHours, hour]);
                          } else {
                            // Se ci sono già 2 orari, sostituisci il primo con il nuovo
                            setSelectedHours([selectedHours[1], hour]);
                          }
                        }}
                      >
                        {hour}
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-center mt-auto">
                    <Button
                      onClick={handleSaveTask}
                      disabled={taskDescription.trim().length === 0 || !selectedListForTask}
                      className="bg-black! text-white px-28! py-3 rounded-3xl! border-0! hover:border-0! font-medium disabled:bg-gray-300! disabled:text-gray-500! disabled:cursor-not-allowed disabled:hover:bg-gray-300!"
                    >
                      Salva
                    </Button>
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
      <Dialog open={isNewListDialogOpen} onOpenChange={setIsNewListDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center">
              Crea una nuova lista
            </DialogTitle>
          </DialogHeader>
          <div className="flex justify-center mt-4 relative min-h-[200px]">
            <div className="w-full max-w-md">
              <Input 
                placeholder="Aggiungi il nome della lista" 
                style={{ backgroundColor: '#f6f6f6', border: 'none', paddingTop: '12px', paddingBottom: '12px' }}
                className="border-0 py-3"
                value={listName}
                onChange={(e) => setListName(e.target.value)}
              />
              <div className="mt-4 w-full" style={{ maxHeight: '400px', overflow: 'auto' }}>
                <style>{`
                  .epr-emoji-category-label,
                  .epr-category-nav {
                    display: none !important;
                  }
                  .epr-frequently-used,
                  .epr-frequently-used-section {
                    margin-bottom: 20px !important;
                    padding-bottom: 20px !important;
                    border-bottom: 1px solid #e5e5e5 !important;
                  }
                  .epr-main,
                  .epr-emoji-category-label,
                  .epr-body,
                  .epr-emoji-category,
                  .epr-search-container {
                    border: none !important;
                    background-color: transparent !important;
                  }
                  .epr-main {
                    background-color: var(--background) !important;
                  }
                `}</style>
                <EmojiPicker 
                  onEmojiClick={(emojiData) => {
                    setListName(prev => prev + emojiData.emoji);
                  }}
                  searchDisabled={false}
                  skinTonesDisabled={true}
                  previewConfig={{
                    showPreview: false
                  }}
                  width="100%"
                  height={400}
                  lazyLoadEmojis={true}
                />
              </div>
              <div className="flex justify-center mt-6">
                  <Button
                    onClick={handleSaveList}
                  disabled={listName.trim().length === 0}
                  className="bg-black! text-white px-28! py-3 rounded-3xl! border-0! hover:border-0! font-medium disabled:bg-gray-300! disabled:text-gray-500! disabled:cursor-not-allowed disabled:hover:bg-gray-300!"
                >
                  Salva
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={isDeleteListDialogOpen} onOpenChange={setIsDeleteListDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center">
              Elimina lista
            </DialogTitle>
            <DialogDescription className="text-center">
              Sei sicuro di voler eliminare questa lista? Questa azione non può essere annullata.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-row gap-2 justify-center sm:justify-center">
            <Button
              onClick={() => setIsDeleteListDialogOpen(false)}
              className="bg-gray-200! text-gray-800 px-8! py-2 rounded-3xl! border-0! hover:border-0! font-medium hover:bg-gray-300!"
            >
              Annulla
            </Button>
            <Button
              onClick={() => {
                // Ottieni il nome della lista prima di eliminarla
                const listName = lists.find(l => l.value === selectedListId)?.label || 'Lista';
                handleDeleteList();
                setIsDeleteListDialogOpen(false);
                // Mostra il toast con l'orario
                const now = new Date();
                const timeString = now.toLocaleTimeString('it-IT', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  second: '2-digit'
                });
                toast.success(
                  <div className="flex flex-col">
                    <div>La lista {listName} è stata eliminata</div>
                    <div className="text-xs text-gray-500 mt-1 self-start">{timeString}</div>
                  </div>,
                  {
                    className: 'border-green-500 border-2',
                    style: {
                      border: '2px solid rgb(34, 197, 94)',
                    },
                  }
                );
              }}
              className="bg-destructive! text-white px-8! py-2 rounded-3xl! border-0! hover:border-0! font-medium hover:bg-destructive/90!"
            >
              Elimina
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isDeleteTaskDialogOpen} onOpenChange={setIsDeleteTaskDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center">
              Elimina task
            </DialogTitle>
            <DialogDescription className="text-center">
              Sei sicuro di voler eliminare questa task?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-row gap-2 justify-center sm:justify-center">
            <Button
              onClick={() => {
                setIsDeleteTaskDialogOpen(false);
                setTaskToDelete(null);
              }}
              className="bg-gray-200! text-gray-800 px-8! py-2 rounded-3xl! border-0! hover:border-0! font-medium hover:bg-gray-300!"
            >
              Annulla
            </Button>
            <Button
              onClick={() => {
                // Ottieni la descrizione della task prima di eliminarla
                const taskDescription = tasks.find(t => t.id === taskToDelete)?.description || 'Task';
                handleDeleteTask();
                setIsDeleteTaskDialogOpen(false);
                // Mostra il toast con l'orario
                const now = new Date();
                const timeString = now.toLocaleTimeString('it-IT', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  second: '2-digit'
                });
                toast.success(
                  <div className="flex flex-col">
                    <div>La task {taskDescription} è stata eliminata</div>
                    <div className="text-xs text-gray-500 mt-1 self-start">{timeString}</div>
                  </div>,
                  {
                    className: 'border-green-500 border-2',
                    style: {
                      border: '2px solid rgb(34, 197, 94)',
                    },
                  }
                );
              }}
              className="bg-destructive! text-white px-8! py-2 rounded-3xl! border-0! hover:border-0! font-medium hover:bg-destructive/90!"
            >
              Elimina
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
            </SidebarProvider>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Home;


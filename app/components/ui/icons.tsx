import {
  ChevronDown,
  ChevronRight,
  FileCode,
  FileText,
  Folder,
  LogOut,
  Play,
  Plus,
  Settings,
  CheckCircle2,
  AlertCircle,
  X,
  type LucideIcon,
} from "lucide-react";

export type Icon = LucideIcon;

export const Icons = {
  logo: FileText,
  play: Play,
  settings: Settings,
  logout: LogOut,
  add: Plus,
  chevronRight: ChevronRight,
  chevronDown: ChevronDown,
  folder: Folder,
  file: FileCode,
  success: CheckCircle2,
  error: AlertCircle,
  close: X,
};

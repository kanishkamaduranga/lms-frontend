
import {
  Dashboard as DashboardIcon,
  Book as BookIcon,
  Person as PersonIcon,
  People as UsersIcon, 
  Folder as FolderIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';

const iconMap = {
  dashboard: DashboardIcon,
  book: BookIcon,
  user: PersonIcon,
  users: UsersIcon,
  folder: FolderIcon,
  settings: SettingsIcon
};

export default function MenuIcon({ iconName }) {
  const IconComponent = iconMap[iconName] || DashboardIcon;
  return <IconComponent />;
}
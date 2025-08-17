export interface IncidentReport {
  id: number;
  type: string;
  reported_by: string;
  location: string;
  status: string;
  assigned: string;
  created_at: string;
}

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: { username: string };
  IncidentReport: { 
    username: string;
    incidentId?: number; 
    isViewMode?: boolean; 
  };
  Profile: { username: string };
  TimeIn: { username: string };
  Notifications: { 
    username: string;
    incidentNotifications?: IncidentReport[];
    onIncidentPress?: (incident: IncidentReport) => void;
  };
};
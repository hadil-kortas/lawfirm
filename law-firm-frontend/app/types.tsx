export interface Client {
    ClientID: number;
    ClientName: string;
  }
  
  export interface Lawyer {
    LawyerID: number;
    LawyerName: string;
  }
  
  export interface Matter {
    MatterID: number;
    ClientID: number;
    MatterType: string;
    LawyerID: number;
    Status: string;
    DetailedDescription: string;
    clientName: string;
  }
  
  export interface MatterTypeCount {
    MatterType: string;
    count: number;
  }
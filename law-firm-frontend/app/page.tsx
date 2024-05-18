"use client";
import { useState, useEffect, FormEvent } from 'react';
import { Label } from "@/components/ui/label";
import { SelectValue, SelectTrigger, SelectItem, SelectContent, Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Client, Lawyer, Matter, MatterTypeCount } from './types';
import '@fortawesome/fontawesome-free/css/all.min.css';



export default function Home() {
  const [matters, setMatters] = useState<Matter[]>([]);
  const [matterTypes, setMatterTypes] = useState<MatterTypeCount[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);

  useEffect(() => {
    fetch('http://localhost:3000/matters')
      .then(response => response.json())
      .then(data => setMatters(data));

    fetch('http://localhost:3000/matter-count-by-type')
      .then(response => response.json())
      .then(data => setMatterTypes(data));

    fetch('http://localhost:3000/clients')
      .then(response => response.json())
      .then(data => setClients(data));
    
    fetch('http://localhost:3000/lawyers')
      .then(response => response.json())
      .then(data => setLawyers(data));
  }, []);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  
    const formData = new FormData(event.currentTarget);
    const data: any = {};
  
    formData.forEach((value, key) => {
      data[key] = value;
    });
    
    // Check if any mandatory field is empty

    for (const key in data) {
      if (!data[key as keyof Matter]) {
        alert('All fields are mandatory');
        return;
      }
    }

    fetch('http://localhost:3000/matters', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    .then(response => {
      if (!response.ok) {
        return response.json().then(errorData => {
          throw new Error(errorData.error);
        });
      }
      return response.json();
    })
    .then(() => {
      // Refresh matters and matter types
      fetch('http://localhost:3000/matters')
        .then(response => response.json())
        .then(data => setMatters(data));

      fetch('http://localhost:3000/matter-count-by-type')
        .then(response => response.json())
        .then(data => setMatterTypes(data));
      })
      .catch((error) => {
        console.error('There has been a problem with your fetch operation:', error);
        alert(error.message);
    });
  };

  const handleDelete = (matterID: number) => {
    fetch(`http://localhost:3000/matters/${matterID}`, {
      method: 'DELETE',
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to delete matter');
        }
        // Remove the deleted matter from the state
        setMatters(prevMatters => prevMatters.filter(matter => matter.MatterID !== matterID));

        // Find the matter type of the deleted matter
        const deletedMatterType = matters.find(matter => matter.MatterID === matterID)?.MatterType;

        // Update the count of the corresponding matter type
        setMatterTypes(prevMatterTypes => {
          const updatedMatterTypes = prevMatterTypes.map(type => {
            if (type.MatterType === deletedMatterType) {
              return { ...type, count: type.count - 1 };
            }
            return type;
          });
          return updatedMatterTypes;
        });
      })
      .catch(error => {
        console.error('There has been a problem with your delete operation:', error);
        alert(error.message);
      });
  };

  return (
    <div className="container mx-auto my-12 max-w-3xl space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Add New Matter</h1>
        <p className="text-gray-500 dark:text-gray-400">Fill out the form to create a new matter for your law firm.</p>
      </div>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="client-name">Client Name</Label>
            <Select name="ClientID">
              <SelectTrigger>
                <SelectValue placeholder="Select client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map(client => (
                  <SelectItem key={client.ClientID} value={client.ClientID.toString()}>{client.ClientName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="matter-type">Matter Type</Label>
            <Select name="MatterType">
              <SelectTrigger>
                <SelectValue placeholder="Select matter type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Litigation">Litigation</SelectItem>
                <SelectItem value="Corporate">Corporate</SelectItem>
                <SelectItem value="Real Estate">Real Estate</SelectItem>
                <SelectItem value="Intellectual Property">Intellectual Property</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="responsible-attorney">Responsible Attorney</Label>
            <Select name="LawyerID">
              <SelectTrigger>
                <SelectValue placeholder="Select attorney" />
              </SelectTrigger>
              <SelectContent>
                {lawyers.map(lawyer => (
                  <SelectItem key={lawyer.LawyerID} value={lawyer.LawyerID.toString()}>{lawyer.LawyerName}</SelectItem>
                ))}
              </SelectContent>
            </Select>          
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select name="Status">
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Closed">Closed</SelectItem>
                <SelectItem value="On Hold">On Hold</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="matter-description">Matter Description</Label>
          <Textarea className="min-h-[100px]" id="matter-description" name="DetailedDescription" placeholder="Enter matter description" />
        </div>
        <Button className="w-full" type="submit">
          Add Matter
        </Button>
      </form>
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold">All Matters</h2>
          <div className="mt-4 divide-y rounded-lg border">
            {matters.map(matter => (
              <div key={matter.MatterID} className="matter-container px-6 py-4">
                <div className="font-medium">{matter.clientName}</div>
                <div>{matter.MatterType}</div>
                <div className={`text-${matter.Status === 'Active' ? 'green' : matter.Status === 'Closed' ? 'red' : 'yellow'}-500`}>{matter.Status}</div>
                <i
                  className="fas fa-trash text-red-500 hover:text-red-700 cursor-pointer delete-icon"
                  onClick={() => handleDelete(matter.MatterID)}
                ></i>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-xl font-bold">Matter Types</h2>
          <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
            {matterTypes.map(type => (
              <div key={type.MatterType} className="rounded-lg border p-4">
                <div className="text-2xl font-bold">{type.count}</div>
                <div className="text-gray-500 dark:text-gray-400">{type.MatterType}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

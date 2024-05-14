"use client";
import { useState, useEffect } from 'react';
import { Label } from "@/components/ui/label"
import { SelectValue, SelectTrigger, SelectItem, SelectContent, Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

export default function Home() {
  const [matters, setMatters] = useState([]);
  const [matterTypes, setMatterTypes] = useState([]);
  const [clients, setClients] = useState([]);
  const [lawyers, setLawyers] = useState([]);

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

  const handleSubmit = (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);

  // Check if all fields are filled out
  if (!data.ClientID || !data.MatterType || !data.LawyerID || !data.Status || !data['matter-description']) {
    alert('All fields are mandatory');
    return;
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
        throw new Error('Network response was not ok');
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
        alert('Error adding matter');
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
            <Select id="client-name" name="ClientID">
              <SelectTrigger>
                <SelectValue placeholder="Select client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map(client => (
                  <SelectItem key={client.ClientID} value={client.ClientID}>{client.ClientName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="matter-type">Matter Type</Label>
            <Select id="matter-type">
              <SelectTrigger>
                <SelectValue placeholder="Select matter type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="litigation">Litigation</SelectItem>
                <SelectItem value="corporate">Corporate</SelectItem>
                <SelectItem value="real-estate">Real Estate</SelectItem>
                <SelectItem value="intellectual-property">Intellectual Property</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="responsible-attorney">Responsible Attorney</Label>
            <Select id="responsible-attorney" name="LawyerID">
              <SelectTrigger>
                <SelectValue placeholder="Select attorney" />
              </SelectTrigger>
              <SelectContent>
                {lawyers.map(lawyer => (
                  <SelectItem key={lawyer.LawyerID} value={lawyer.LawyerID}>{lawyer.LawyerName}</SelectItem>
                ))}
              </SelectContent>
            </Select>          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select id="status">
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="matter-description">Matter Description</Label>
          <Textarea className="min-h-[100px]" id="matter-description" placeholder="Enter matter description" />
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
              <div key={matter.MatterID} className="grid grid-cols-[1fr_1fr_1fr] items-center gap-4 px-6 py-4">
                <div className="font-medium">{matter.clientName}</div>
                <div>{matter.MatterType}</div>
                <div className={`text-${matter.Status === 'Active' ? 'green' : matter.Status === 'Closed' ? 'red' : 'yellow'}-500`}>{matter.Status}</div>
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
  )
}

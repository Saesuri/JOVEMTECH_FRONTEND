import React, { useState } from 'react';
import { type RoomShape } from '../../types/apiTypes';

// SHADCN
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox"; // Install if needed: npx shadcn@latest add checkbox
import { Trash2, Wifi, Tv, Projector, Mic, Video, Wind } from "lucide-react";

interface RoomEditModalProps {
  room: RoomShape | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, updates: { name: string; capacity: number; type: string; amenities: string[] }) => void;
  onDelete: (id: string) => void;
}

// Available Amenities List
const AMENITY_OPTIONS = [
  { id: "wifi", label: "Wi-Fi Dedicated", icon: Wifi },
  { id: "tv", label: "TV / Monitor", icon: Tv },
  { id: "projector", label: "Projector", icon: Projector },
  { id: "whiteboard", label: "Whiteboard", icon: null },
  { id: "video_conf", label: "Video Conf", icon: Video },
  { id: "ac", label: "Air Conditioning", icon: Wind },
  { id: "mic", label: "Microphone/Audio", icon: Mic },
];

const RoomEditModal: React.FC<RoomEditModalProps> = ({ room, isOpen, onClose, onSave, onDelete }) => {
  // Init State
  const [name, setName] = useState(room?.name || '');
  const [capacity, setCapacity] = useState(10);
  const [type, setType] = useState('meeting_room');
  const [amenities, setAmenities] = useState<string[]>([]); // New state

  // Update state when room changes
  React.useEffect(() => {
    if (room) {
      setName(room.name);
      setCapacity(room.capacity || 10);
      setType(room.type || 'meeting_room');
      setAmenities(room.amenities || []);
    }
  }, [room]);

  const handleOpenChange = (open: boolean) => {
    if (!open) onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (room) {
      onSave(room.id, { name, capacity, type, amenities });
      onClose();
    }
  };

  const handleDeleteClick = () => {
    if (room && confirm(`Delete "${room.name}"?`)) {
      onDelete(room.id);
      onClose();
    }
  };

  const toggleAmenity = (id: string) => {
    setAmenities(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  if (!room) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Room</DialogTitle>
          <DialogDescription>Modify {room.name}</DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          {/* Top Row: Name & Cap */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Capacity</Label>
              <Input type="number" value={capacity} onChange={e => setCapacity(Number(e.target.value))} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="meeting_room">Meeting Room</SelectItem>
                <SelectItem value="lab">Computer Lab</SelectItem>
                <SelectItem value="auditorium">Auditorium</SelectItem>
                <SelectItem value="office">Shared Office</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* AMENITIES GRID */}
          <div className="space-y-3">
            <Label>Amenities & Equipment</Label>
            <div className="grid grid-cols-2 gap-3 border p-3 rounded-md bg-slate-50 dark:bg-slate-900/50">
              {AMENITY_OPTIONS.map((item) => (
                <div key={item.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={item.id} 
                    checked={amenities.includes(item.id)}
                    onCheckedChange={() => toggleAmenity(item.id)}
                  />
                  <label htmlFor={item.id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2 cursor-pointer">
                    {item.icon && <item.icon className="h-3 w-3 text-muted-foreground" />}
                    {item.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter className="flex justify-between w-full mt-2">
            <Button type="button" variant="destructive" size="icon" onClick={handleDeleteClick}><Trash2 className="h-4 w-4" /></Button>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit">Save</Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RoomEditModal;
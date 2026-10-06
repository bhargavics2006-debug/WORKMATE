import React, { useState } from 'react';
import {
  AlertTriangle,
  Phone,
  MessageSquare,
  ShieldAlert,
  Flame,
  HeartPulse,
  Car,
  Lock,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Clock,
  MapPin,
  X,
  AlertOctagon,
  ChevronRight,
} from 'lucide-react';
import { useWorkmate } from '../../context/WorkmateContext';
import { EmergencyType, EmergencyContact } from '../../types';

export const EmergencyView: React.FC = () => {
  const {
    emergencyContacts,
    emergencyEvents,
    triggerEmergencySOS,
    resolveEmergencyEvent,
    addEmergencyContact,
    deleteEmergencyContact,
    settings,
  } = useWorkmate();

  // SOS Trigger Flow States
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedType, setSelectedType] = useState<EmergencyType>('Medical');
  const [selectedContactId, setSelectedContactId] = useState<string>(
    emergencyContacts[0]?.id || ''
  );
  const [incidentNotes, setIncidentNotes] = useState('');
  const [incidentLocation, setIncidentLocation] = useState('Site Alpha - Main Workshop');

  // Active Alert Display Screen
  const [activeIncident, setActiveIncident] = useState<{
    type: EmergencyType;
    contact: EmergencyContact;
    notes: string;
    location: string;
  } | null>(null);

  // Manage Contacts Modal
  const [isAddContactModalOpen, setIsAddContactModalOpen] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactRole, setNewContactRole] = useState('Safety Officer');
  const [newContactRel, setNewContactRel] = useState('Site Emergency Team');

  const emergencyTypes: { type: EmergencyType; label: string; icon: React.FC<{ className?: string }>; color: string }[] = [
    { type: 'Medical', label: 'Medical / Injury', icon: HeartPulse, color: 'text-red-400 bg-red-950/60 border-red-500/50' },
    { type: 'Accident', label: 'Machinery / Fall Accident', icon: Car, color: 'text-orange-400 bg-orange-950/60 border-orange-500/50' },
    { type: 'Fire', label: 'Fire / Chemical Hazard', icon: Flame, color: 'text-amber-400 bg-amber-950/60 border-amber-500/50' },
    { type: 'Security', label: 'Site Security / Threat', icon: Lock, color: 'text-blue-400 bg-blue-950/60 border-blue-500/50' },
    { type: 'Other', label: 'Other Hazard', icon: AlertTriangle, color: 'text-purple-400 bg-purple-950/60 border-purple-500/50' },
  ];

  const handleInitiateSOS = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmSOS = () => {
    const contact = emergencyContacts.find(c => c.id === selectedContactId) || emergencyContacts[0];
    if (!contact) return;

    // Trigger state in context
    triggerEmergencySOS(
      selectedType,
      contact.name,
      contact.phone,
      incidentNotes,
      incidentLocation
    );

    setActiveIncident({
      type: selectedType,
      contact,
      notes: incidentNotes,
      location: incidentLocation,
    });

    setShowConfirmModal(false);
  };

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName.trim() || !newContactPhone.trim()) return;

    addEmergencyContact({
      name: newContactName.trim(),
      phone: newContactPhone.trim(),
      role: newContactRole,
      relationship: newContactRel,
      isPrimary: emergencyContacts.length === 0,
    });

    setNewContactName('');
    setNewContactPhone('');
    setIsAddContactModalOpen(false);
  };

  return (
    <div className="space-y-5 pb-20 lg:pb-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-red-950/90 via-slate-900 to-slate-900 border border-red-500/40 rounded-3xl p-5 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping inline-block" />
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-red-500" />
              Emergency Response & SOS Command
            </h2>
          </div>
          <p className="text-xs text-red-200/80 mt-1">
            Rapid safety broadcast, emergency speed dial (`tel:` / `sms:`), and OSHA incident audit
          </p>
        </div>

        <button
          onClick={() => setIsAddContactModalOpen(true)}
          className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-red-400" />
          <span>Add Emergency Contact</span>
        </button>
      </div>

      {/* ACTIVE EMERGENCY BROADCAST SCREEN (If Triggered) */}
      {activeIncident && (
        <div className="bg-red-950 border-2 border-red-500 rounded-3xl p-5 sm:p-6 shadow-2xl text-red-100 space-y-4 animate-shake">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-2xl bg-red-600 text-white animate-pulse">
                <AlertOctagon className="w-8 h-8" />
              </div>
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-white text-red-900">
                  CRITICAL INCIDENT ACTIVE
                </span>
                <h3 className="text-lg sm:text-xl font-black text-white mt-1">
                  {activeIncident.type} Emergency Reported
                </h3>
                <p className="text-xs text-red-200">
                  Location: <b>{activeIncident.location}</b>
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveIncident(null)}
              className="text-red-300 hover:text-white p-1 text-sm font-bold"
            >
              ✕ Close Alert
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-red-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-red-300 block text-[11px]">Designated Responder:</span>
              <span className="font-extrabold text-white text-sm">{activeIncident.contact.name}</span>
              <span className="text-red-300 ml-2">({activeIncident.contact.role})</span>
            </div>

            <div className="flex items-center space-x-2">
              <a
                href={`tel:${activeIncident.contact.phone}`}
                className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs flex items-center space-x-1.5 shadow-lg shadow-red-600/30 transition"
              >
                <Phone className="w-4 h-4 stroke-[3]" />
                <span>Call Now: {activeIncident.contact.phone}</span>
              </a>

              <a
                href={`sms:${activeIncident.contact.phone}?body=EMERGENCY SOS: ${activeIncident.type} incident at ${activeIncident.location}. Immediate response requested.`}
                className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center space-x-1 border border-red-500/30 transition"
              >
                <MessageSquare className="w-4 h-4" />
                <span>SMS Alert</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* GIANT SOS ACTION BUTTON */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-4 shadow-xl">
        <div className="max-w-md mx-auto space-y-2">
          <h3 className="text-base font-extrabold text-white">Press for Immediate Site Assistance</h3>
          <p className="text-xs text-slate-400">
            Triggers emergency broadcast to team chat, alerts safety responders, and provides 1-tap direct dial.
          </p>
        </div>

        <div className="py-4">
          <button
            onClick={handleInitiateSOS}
            className="group relative inline-flex items-center justify-center p-8 sm:p-10 rounded-full bg-gradient-to-br from-red-600 to-rose-700 text-white font-black text-2xl sm:text-3xl tracking-widest shadow-2xl shadow-red-600/40 hover:scale-105 active:scale-95 transition-all duration-300 border-4 border-red-400/50"
          >
            <span className="absolute -inset-2 rounded-full border-2 border-red-500/40 animate-ping pointer-events-none" />
            <div className="flex flex-col items-center">
              <ShieldAlert className="w-10 h-10 mb-1" />
              <span>SOS</span>
            </div>
          </button>
        </div>

        <div className="text-[11px] text-slate-500 font-medium">
          Requires confirmation before dialing. Zero accidental calls.
        </div>
      </div>

      {/* Emergency Contacts & Protocol Hub */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Contact Speed Dial List */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-400" />
              Emergency Contacts Directory
            </h3>
            <span className="text-xs text-slate-400">{emergencyContacts.length} contacts</span>
          </div>

          <div className="space-y-2 text-xs">
            {emergencyContacts.map(contact => (
              <div
                key={contact.id}
                className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold text-white text-sm">{contact.name}</span>
                    {contact.isPrimary && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Primary
                      </span>
                    )}
                  </div>
                  <div className="text-slate-400 text-[11px] mt-0.5">
                    {contact.role} • <span className="text-slate-300">{contact.relationship}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <a
                    href={`tel:${contact.phone}`}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center space-x-1 shadow-md transition"
                    title={`Call ${contact.name}`}
                  >
                    <Phone className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Call</span>
                  </a>

                  <button
                    onClick={() => {
                      if (confirm(`Remove emergency contact ${contact.name}?`)) {
                        deleteEmergencyContact(contact.id);
                      }
                    }}
                    className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg"
                    title="Delete contact"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Emergency Incidents Log */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              Incident & SOS Audit History
            </h3>
            <span className="text-xs text-slate-400">{emergencyEvents.length} events logged</span>
          </div>

          {emergencyEvents.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              No emergency incidents logged. Site safety status is normal.
            </div>
          ) : (
            <div className="space-y-2 text-xs">
              {emergencyEvents.map(event => (
                <div
                  key={event.id}
                  className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-white text-xs">{event.type} Incident</span>
                      <span
                        className={`px-1.5 py-0.2 rounded text-[10px] font-black uppercase ${
                          event.status === 'resolved'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-red-500 text-white'
                        }`}
                      >
                        {event.status}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500">
                      {new Date(event.timestamp).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300">{event.notes || 'No description provided'}</p>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                    <span>Contacted: {event.contactName} ({event.contactPhone})</span>
                    {event.status !== 'resolved' && (
                      <button
                        onClick={() => resolveEmergencyEvent(event.id)}
                        className="text-emerald-400 hover:underline font-bold"
                      >
                        Mark Resolved
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CONFIRMATION DIALOG MODAL */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-red-500 rounded-3xl w-full max-w-md p-5 sm:p-6 text-slate-100 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="w-6 h-6 text-red-500 animate-pulse" />
                <h3 className="font-extrabold text-base text-white">Emergency Confirmation</h3>
              </div>
              <button onClick={() => setShowConfirmModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Type selector */}
              <div>
                <label className="block font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  1. Select Emergency Type *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {emergencyTypes.map(item => {
                    const Icon = item.icon;
                    const isSel = selectedType === item.type;
                    return (
                      <button
                        key={item.type}
                        type="button"
                        onClick={() => setSelectedType(item.type)}
                        className={`p-2.5 rounded-xl border text-left flex items-center space-x-2 transition ${
                          isSel
                            ? 'bg-red-950/80 border-red-500 text-white font-black'
                            : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:border-slate-600'
                        }`}
                      >
                        <Icon className="w-4 h-4 text-red-400 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Contact speed dial target */}
              <div>
                <label className="block font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  2. Select Designated Responder *
                </label>
                <select
                  value={selectedContactId}
                  onChange={e => setSelectedContactId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                >
                  {emergencyContacts.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} — {c.phone} ({c.role})
                    </option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div>
                <label className="block font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Site Location
                </label>
                <input
                  type="text"
                  value={incidentLocation}
                  onChange={e => setIncidentLocation(e.target.value)}
                  placeholder="e.g. Site Alpha, Scaffold level 3"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Brief Situation Note
                </label>
                <input
                  type="text"
                  value={incidentNotes}
                  onChange={e => setIncidentNotes(e.target.value)}
                  placeholder="e.g. Worker slipped; medical kit dispatched."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-xs"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmSOS}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-black text-xs rounded-xl shadow-xl shadow-red-600/40 flex items-center space-x-1.5"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>CONFIRM & TRIGGER SOS</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Contact Modal */}
      {isAddContactModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm p-5 text-slate-100 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base text-white">Add Emergency Contact</h3>
              <button onClick={() => setIsAddContactModalOpen(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveContact} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Contact Name *
                </label>
                <input
                  type="text"
                  required
                  value={newContactName}
                  onChange={e => setNewContactName(e.target.value)}
                  placeholder="e.g. Dr. Robert Mills"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Phone Number (for direct dial) *
                </label>
                <input
                  type="tel"
                  required
                  value={newContactPhone}
                  onChange={e => setNewContactPhone(e.target.value)}
                  placeholder="+1 (555) 911-0000"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Designation / Role
                </label>
                <input
                  type="text"
                  value={newContactRole}
                  onChange={e => setNewContactRole(e.target.value)}
                  placeholder="e.g. Trauma Nurse, OSHA Lead"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Organization / Relation
                </label>
                <input
                  type="text"
                  value={newContactRel}
                  onChange={e => setNewContactRel(e.target.value)}
                  placeholder="e.g. City Hospital, On-site Medic"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddContactModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white font-black rounded-xl shadow-md"
                >
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

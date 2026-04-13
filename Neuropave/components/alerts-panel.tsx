'use client';

import { useState, useEffect } from 'react';
import { Alert } from '@/lib/mock-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, X, Bell, ShieldAlert, ShieldCheck } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AlertsPanelProps {
  alerts: Alert[];
  onAlertResolve?: (alertId: string) => void;
  onAlertDismiss?: (alertId: string) => void;
}

export function AlertsPanel({ alerts, onAlertResolve, onAlertDismiss }: AlertsPanelProps) {
  const [displayAlerts, setDisplayAlerts] = useState<Alert[]>(alerts);
  const [activeTab, setActiveTab] = useState('active');

  useEffect(() => {
    setDisplayAlerts(alerts);
  }, [alerts]);

  const activeAlerts = displayAlerts.filter((a) => !a.resolved);
  const resolvedAlerts = displayAlerts.filter((a) => a.resolved);
  const criticalAlerts = activeAlerts.filter((a) => a.severity === 'critical');
  const warningAlerts = activeAlerts.filter((a) => a.severity === 'warning');

  const handleResolve = (alertId: string) => {
    setDisplayAlerts(
      displayAlerts.map((a) => (a.id === alertId ? { ...a, resolved: true } : a))
    );
    onAlertResolve?.(alertId);
  };

  const handleDismiss = (alertId: string) => {
    setDisplayAlerts(displayAlerts.filter((a) => a.id !== alertId));
    onAlertDismiss?.(alertId);
  };

  const renderAlertList = (alertList: Alert[]) => {
    if (alertList.length === 0) {
      return (
        <div className="text-center py-10">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
          </div>
          <p className="text-sm font-semibold text-white/50">
            {activeTab === 'active' ? 'All Clear' : 'No resolved alerts'}
          </p>
          <p className="text-xs text-white/25 mt-1">
            {activeTab === 'active' ? 'No active alerts at this time' : 'Resolved alerts will appear here'}
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {alertList.map((alert) => {
          const isCritical = alert.severity === 'critical';
          return (
            <div
              key={alert.id}
              className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all duration-200 hover:translate-x-0.5 group ${
                isCritical
                  ? 'bg-rose-500/[0.06] border-rose-500/20 hover:border-rose-500/30'
                  : 'bg-amber-500/[0.06] border-amber-500/20 hover:border-amber-500/30'
              }`}
            >
              <div className={`flex-shrink-0 mt-0.5 p-1.5 rounded-lg ${isCritical ? 'bg-rose-500/10' : 'bg-amber-500/10'}`}>
                {isCritical ? (
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-sm text-white/85 tracking-tight">{alert.sensorName}</p>
                    <p className="text-xs text-white/35 mt-0.5 leading-relaxed">{alert.message}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-[9px] uppercase tracking-[0.12em] font-bold border rounded-md py-0.5 flex-shrink-0 ${
                      isCritical
                        ? 'bg-rose-500/15 text-rose-400 border-rose-500/25'
                        : 'bg-amber-500/15 text-amber-400 border-amber-500/25'
                    }`}
                  >
                    {alert.severity}
                  </Badge>
                </div>
                <p className="text-[10px] text-white/20 mt-2 font-medium">
                  {(() => {
                    const timestamp = typeof alert.timestamp === 'string' ? new Date(alert.timestamp) : alert.timestamp;
                    return timestamp.toLocaleTimeString();
                  })()}
                </p>
              </div>
              <div className="flex items-center gap-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                {!alert.resolved && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleResolve(alert.id)}
                    title="Mark as resolved"
                    className="h-7 w-7 p-0 text-white/30 hover:text-emerald-400 hover:bg-emerald-500/10"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDismiss(alert.id)}
                  title="Dismiss"
                  className="h-7 w-7 p-0 text-white/30 hover:text-rose-400 hover:bg-rose-500/10"
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Card className="col-span-full border-white/[0.06] bg-[#080c1a]/60 backdrop-blur-xl overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/[0.04] border border-white/[0.06]">
              <Bell className="w-4 h-4 text-white/50" />
            </div>
            <div>
              <CardTitle className="text-base font-bold tracking-tight">System Alerts</CardTitle>
              <CardDescription className="text-xs text-white/30">Real-time notifications and anomalies</CardDescription>
            </div>
          </div>
          <div className="flex gap-2">
            {criticalAlerts.length > 0 && (
              <Badge className="bg-rose-500/15 text-rose-400 border border-rose-500/25 font-bold text-[10px] uppercase tracking-wider rounded-lg">
                {criticalAlerts.length} Critical
              </Badge>
            )}
            {warningAlerts.length > 0 && (
              <Badge className="bg-amber-500/15 text-amber-400 border border-amber-500/25 font-bold text-[10px] uppercase tracking-wider rounded-lg">
                {warningAlerts.length} Warning
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 bg-white/[0.03] border border-white/[0.06] rounded-xl p-1">
            <TabsTrigger value="active" className="rounded-lg text-xs font-bold data-[state=active]:bg-white/[0.06]">
              Active ({activeAlerts.length})
            </TabsTrigger>
            <TabsTrigger value="resolved" className="rounded-lg text-xs font-bold data-[state=active]:bg-white/[0.06]">
              Resolved ({resolvedAlerts.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-4">
            {renderAlertList(activeAlerts)}
          </TabsContent>

          <TabsContent value="resolved" className="mt-4">
            {renderAlertList(resolvedAlerts)}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

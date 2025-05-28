
import type { OrderStatus } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ORDER_STATUSES, getStatusIcon } from '@/lib/constants';

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const statusInfo = ORDER_STATUSES.find(s => s.value === status) || { value: status, label: status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) };
  const IconComponent = getStatusIcon(status);

  let variant: "default" | "secondary" | "destructive" | "outline" = "default";
  switch (status) {
    case 'pending':
    case 'processing':
    case 'accepted':
    case 'handed_over':
    case 'in_shipping':
      variant = 'outline';
      break;
    case 'shipped':
      variant = 'default'; // Primary color for active positive status
      break;
    case 'delivered':
      variant = 'secondary'; // Using accent color for completion
      break;
    case 'cancelled':
      variant = 'destructive';
      break;
    default:
      variant = 'outline';
  }

  // Custom styling for 'delivered' to use accent color
  const badgeClass = cn(
    "capitalize",
    status === 'delivered' ? 'bg-accent text-accent-foreground border-accent' : '',
    status === 'shipped' ? 'bg-primary/80 text-primary-foreground border-primary/80' : ''
  );


  return (
    <Badge variant={variant} className={badgeClass}>
      {IconComponent && <IconComponent className="mr-1.5 h-3.5 w-3.5" />}
      {statusInfo.label}
    </Badge>
  );
}

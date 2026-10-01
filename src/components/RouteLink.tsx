import React from 'react';
import { shouldNavigate } from '../services/routing';

interface RouteLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  onNavigate: () => void;
}

export const RouteLink: React.FC<RouteLinkProps> = ({ onNavigate, ...props }) => (
  <a
    {...props}
    onClick={(event) => {
      props.onClick?.(event);
      if (shouldNavigate(event) && (!props.target || props.target === '_self') && !props.download) {
        event.preventDefault();
        onNavigate();
      }
    }}
  />
);

// src/components/ui/InputWithIcon.tsx
import React from 'react';

interface InputWithIconProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon: React.ReactNode;
}

const InputWithIcon = React.forwardRef<HTMLInputElement, InputWithIconProps>(
  ({ icon, className, ...props }, ref) => {
    return (
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          {icon}
        </div>
        <input
          ref={ref}
          className={`w-full rounded-md border border-gray-300 py-2.5 pl-10 pr-4 text-gray-800 shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 ${className}`}
          {...props}
        />
      </div>
    );
  }
);

InputWithIcon.displayName = 'InputWithIcon';

export { InputWithIcon };
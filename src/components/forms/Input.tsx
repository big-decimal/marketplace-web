import { formControlHeight } from "@/common/app.config";
import { forwardRef, ReactNode } from "react";

export interface InputProps<ElementType>
  extends React.InputHTMLAttributes<ElementType> {
  label?: ReactNode;
  error?: string;
  hideErrorMessage?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps<HTMLInputElement>>(
  ({ id, label, className, error, style, hideErrorMessage, ...props }, ref) => {

    return (
      <>
        {label && (
          <label htmlFor={id} className="form-label">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={`form-control px-3 ${error ? "is-invalid" : ""} ${
            className ?? ""
          }`}
          style={{
            ...style,
            height: formControlHeight
          }}
          {...props}
        />
        {error && !hideErrorMessage && <div className="invalid-feedback">{error}</div>}
      </>
    );
  }
);

Input.displayName = "Input";

export default Input;

import { forwardRef } from "react";
import { InputProps } from "./Input";

interface TextareaInputProps extends InputProps<HTMLTextAreaElement> {}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaInputProps>(
  ({ id, label, error, className, style, ...props }, ref) => {
    return (
      <>
        {label && (
          <label htmlFor={id} className="form-label">
            {label}
          </label>
        )}
        <textarea
          id={id}
          ref={ref}
          className={`form-control p-3 ${error ? "is-invalid" : ""}`}
          style={{
            height: 120
          }}
          {...props}
        />
        {error && <div className="invalid-feedback">{error}</div>}
      </>
    );
  }
);

Textarea.displayName = "Textarea";

export default Textarea;

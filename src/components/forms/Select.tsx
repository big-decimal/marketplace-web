import { forwardRef, ReactNode } from "react";
import { formControlHeight } from "../../common/app.config";
import { InputProps } from "./Input";

interface SelectInputProps extends InputProps<HTMLSelectElement> {
  children: ReactNode;
}

const Select = forwardRef<HTMLSelectElement, SelectInputProps>(
  ({ id, label, className, style, children, error, ...props }, ref) => {
    
    return (
      <>
        {label && <label className="form-label">{label}</label>}
        <select
          id={id}
          ref={ref}
          className={`form-select ps-3 ${error ? "is-invalid" : ""} ${
            className ?? ""
          }`}
          style={{
            ...style,
            height: formControlHeight
          }}
          {...props}
        >
          {children}
        </select>
        {error && <div className="invalid-feedback">{error}</div>}
      </>
    );
  }
);

Select.displayName = "Select";

export default Select;

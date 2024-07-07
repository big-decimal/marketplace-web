"use client";
import { RiEyeLine, RiEyeOffLine } from "@remixicon/react";
import { forwardRef, useState } from "react";
import { formControlHeight } from "../../common/app.config";
import { InputProps } from "./Input";

interface PasswordInputProps extends InputProps<HTMLInputElement> {}

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ id, label, className, error, style, type, ...props }, ref) => {
    const [isPassword, setIsPassword] = useState(true);

    return (
      <>
        {label && <label className="form-label">{label}</label>}
        <div className={`input-group ${error ? "has-validation" : ""}`}>
          <input
            ref={ref}
            id={id}
            type={isPassword ? "password" : "text"}
            className={`form-control px-3 ${error ? "is-invalid" : ""}`}
            style={{
              ...style,
              height: formControlHeight
            }}
            {...props}
          />
          <div
            className="input-group-text px-3"
            role="button"
            onClick={() => setIsPassword(!isPassword)}
          >
            {isPassword ? <RiEyeOffLine size={20} /> : <RiEyeLine size={20} />}
          </div>
          {error && <div className="invalid-feedback">{error}</div>}
        </div>
      </>
    );
  }
);

PasswordInput.displayName = "PasswordInput";

export default PasswordInput;

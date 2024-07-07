"use client";
import ChangePassword from "./change-password";
import ProfileUpdate from "./profile-update";

function SettingPage() {
  return (
    <div className="card">
      <div className="card-body p-md-4">
        <ProfileUpdate />
        <hr className="bg-dark-gray" />
        <ChangePassword />
      </div>
    </div>
  );
}

export default SettingPage;

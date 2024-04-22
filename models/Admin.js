import { Schema, model } from "mongoose";

const AdminSchema = new Schema({
  // Add any necessary fields for the admin model
});

const Admin = model("Admin", AdminSchema);
export default Admin;

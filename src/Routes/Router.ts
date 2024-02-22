
import express, { Router } from "express";
import {  getPdfReportById, registerEmployee, techrequest, updateRequestById } from "../controller/userCont";
let router = express.Router();

// router.post("/sendrequest/:id", createRequest)
router.post("/requestit", techrequest)
router.post("/signup", registerEmployee)


router.get("/getreport/:id", getPdfReportById);


router.put("/update/:id", updateRequestById )


export default router;
import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import argon2 from'argon2'
import { jsPDF } from 'jspdf';
import puppeteer from 'puppeteer';
import fs from 'fs';


const prisma = new PrismaClient();



export const registerEmployee = async (req: Request, res: Response) => {
  const { fname, mname, lname, jobID, dept, jbname, isMgr } = req.body;

  try {
    // Check if jobID already exists
    const existingEmployee = await prisma.emply.findUnique({
      where: {
        jobID,
      },
    });

    if (existingEmployee) {
      // Job ID already exists
      console.error('Error registering employee: Job ID already exists');
      res.status(400).json({ error: 'Job ID already exists' });
      return;
    }

    // Create employee record
    const createdEmployee = await prisma.emply.create({
      data: {
        fname,
        mname,
        lname,
        jobID,
        dept,
        jbname,
        isMgr
      }
    });

    console.log('Employee registered successfully:', createdEmployee);
    res.status(201).json(createdEmployee);
  } catch (error) {
    console.error('Error registering employee:', error);
    res.status(500).json({ error: 'Could not register employee' });
  }
};


// export const createRequest = async (req: Request, res: Response) => {
//   try {
//     const { whoAccepted,
//       dateOfAcceptance,
//       reason,
//       comments,
//       attachments,
//       approvalStatus,
//       approverComments,
//       createdBy,
//       createdAt,
//       updatedBy,
//       updatedAt,
//       dept,
//       fname,
//       isAccepted,
//       jobID,
//       lname,
//       mname} = req.body;

//     // Check if the employee already exists in the emply table
//     const existingEmployee = await prisma.emply.findUnique({
//       where: { jobID },
//     });

//     // If the employee doesn't exist, create a new employee
//     if (!existingEmployee) {
//       await prisma.emply.create({
//         data: {
//           fname,
//           mname,
//           lname,
//           jobID,
//           dept,
//         },
//       });
//     }

//     // Create the request in the Rqst table
//     const createdRequest = await prisma.rqst.create({
//       data: {
//         whoAccepted,
//         dateOfAcceptance,
//         reason,
//         comments,
//         attachments,
//         approvalStatus,
//         approverComments,
//         createdBy,
//         createdAt,
//         updatedBy,
//         updatedAt,
//         dept,
//         fname,
//         isAccepted,
//         jobID,
//         lname,
//         mname,
//       },
//     });

//     // If the request is accepted, update existing employee or create new employee in the emply table
//     if (isAccepted) {
//       await prisma.emply.update({
//         where: { jobID },
//         data: {
//           fname,
//           mname,
//           lname,
//           dept,
//           rqst: {
//             connect: { id: createdRequest.id },
//           },
//         },
//       });
//     }

//     res.status(201).json({ message: 'Request created successfully' });
//   } catch (error) {
//     console.error('Error creating request:', error);

//     let errorMessage = 'Internal server error';

//     // Specific error handling based on the error type
//     if (error instanceof Error) {
//       errorMessage = error.message;
//     }

//     res.status(500).json({ error: errorMessage });
//   } finally {
//     await prisma.$disconnect();
//   }
// };


// signup
export const signup = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    // Check if username or email already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: username },
          { email: email },
        ],
      },
    });

    if (existingUser) {
      return res.status(409).json({ message: 'Username or email already exists' });
    }

    // Hash the password using Argon2
    const hashedPassword = await argon2.hash(password);

    // Create a new user in the database
    const newUser = await prisma.user.create({
      data: {
        username: username,
        email: email,
        password: hashedPassword,
      },
    });

    // Remove sensitive information before sending the response
    const sanitizedUser = { id: newUser.id, username: newUser.username, email: newUser.email };

    res.status(201).json({ user: sanitizedUser, message: 'User created successfully' });
  } catch (error) {
    console.error('Error during signup:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
};


// Bakhsh create user


export const createUser = async (req: Request, res: Response) => {
  try {
    const { fname, mname, lname, jobID, dept, jbname, isMgr } = req.body;

    // Check if jobID is missing in the request body
    if (!jobID) {
      return res.status(400).json({ error: 'Missing jobID in the request body' });
    }

    // Check if the user with the provided jobID already exists
    const existingUser = await prisma.emply.findUnique({
      where: { jobID },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User with the provided jobID already exists' });
    }

    // Create a new user
    const newUser = await prisma.emply.create({
      data: {
        fname: fname,
        mname: mname,
        lname: lname,
        jobID: jobID,
        dept: dept,
        jbname: jbname,
        isMgr: isMgr || false,
      },
    });

    res.status(201).json({ message: 'User created successfully', user: newUser });
  } catch (error) {
    console.error('Error creating user:', error);

    let errorMessage = 'Internal server error';

    if (error instanceof Error) {
      errorMessage = error.message;
    }

    res.status(500).json({ error: errorMessage });
  } finally {
    await prisma.$disconnect();
  }
};


export const createRequest = async (req: Request, res: Response) => {
  try {
    const {
      reason,
      comments,
      attachments,
      dept,
      fname,
      jobID,
      lname,
      mname,
    } = req.body;

    // Assuming you have a way to identify the user making the request, 
    // you can obtain the user ID or username from the request object.
    const createdBy = req.params.id; // Replace with the actual property that represents the user ID

    const existingEmployee = await prisma.emply.findUnique({
      where: { jobID },
    });

    if (!existingEmployee) {
      await prisma.emply.create({
        data: {
          fname,
          mname,
          lname,
          jobID,
          dept,
        },
      });
    }

    const createdRequest = await prisma.rqst.create({
      data: {
        whoAccepted: jobID,
        dateOfAcceptance: new Date(),
        reason,
        comments,
        attachments,
        approvalStatus: "pending",
        approverComments: undefined,
        createdBy,
        dept,
        fname,
        isAccepted: false,
        jobID,
        lname,
        mname,
      },
    });

    res.status(201).json({ message: 'Request created successfully' });
  } catch (error) {
    console.error('Error creating request:', error);

    let errorMessage = 'Internal server error';

    if (error instanceof Error) {
      errorMessage = error.message;
    }

    res.status(500).json({ error: errorMessage });
  } finally {
    await prisma.$disconnect();
  }
};






// request
export const techrequest = async (req:Request, res:Response) => {
  const { ujobid, fname, mname, lname, dept, sendersign, ceoapproval } = req.body;

  try {
    // Create a new fngrqst record
    const createdFngrqst = await prisma.fngrqst.create({
      data: {
        ujobid,
        fname,
        mname,
        lname,
        dept,
        sendersign
      }
    });

    console.log('Created fngrqst:', createdFngrqst);

    // If CEO approval is true, generate and stream the PDF document
    if (ceoapproval) {
      // Concatenate first name, middle name, and last name into a single word
      const fullName = `${fname} ${mname} ${lname}`;

      // Create a new PDF document
      const pdfDoc = new jsPDF();

      // Set font styles
      pdfDoc.setFont('helvetica');
      pdfDoc.setFontSize(20);

      // Add header title "IT Staff Request" in bold and centered
      pdfDoc.setFont('bold');
      pdfDoc.text('IT Staff Request', pdfDoc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
      pdfDoc.setFont('normal');

      // Add user details in a table format
      const userDetails = [
        `Job ID: ${createdFngrqst.ujobid}`,
        `Full Name: ${fullName}`,
        `Department: ${createdFngrqst.dept}`,
        `Sender Sign: ${createdFngrqst.sendersign}`
      ];
      let userDetailsY = 50;
      userDetails.forEach((detail, index) => {
        pdfDoc.text(detail, pdfDoc.internal.pageSize.getWidth() / 4, userDetailsY + (index * 10), { align: 'left' });
        if (index % 2 !== 0) {
          userDetailsY += 10; // Move to the next line after every two details
        }
      });

      // Add CEO signature with blue color outline
      const signatureX = pdfDoc.internal.pageSize.getWidth() - 60;
      const signatureY = pdfDoc.internal.pageSize.getHeight() - 20;
      pdfDoc.setDrawColor(0, 0, 255); // Blue color for lines
      pdfDoc.rect(signatureX, signatureY - 10, 50, 20); // Draw square with blue outline
      pdfDoc.text('Rania B.', signatureX + 5, signatureY); // Add CEO signature text

      // Save the PDF
      const pdfData = pdfDoc.output();

      // Set response headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=fngrqst_approval.pdf');

      // Send the PDF data in the response
      res.send(pdfData);

      console.log('PDF created successfully');

      // Return here to prevent further execution
      return;
    }

    // Respond with the created fngrqst record
    res.status(201).json(createdFngrqst);
  } catch (error) {
    console.error('Error creating fngrqst:', error);
    res.status(500).json({ error: 'Could not create fngrqst' });
  } finally {
    await prisma.$disconnect();
  }
};









// update request


export const updateRequestById = async (req: Request, res: Response) => {
  const { id } = req.params; // Assuming ID is passed in the request URL
  const { ujobid, fname, mname, lname, dept, itapproval, ceoapproval, sendersign } = req.body;

  try {
    const updatedFngrqst = await prisma.fngrqst.update({
      where: {
        id: id // ID of the request to update
      },
      data: {
        ujobid: ujobid,
        fname: fname,
        mname: mname,
        lname: lname,
        dept: dept,
        itapproval: itapproval,
        ceoapproval: ceoapproval,
        sendersign: sendersign
      }
    });
    console.log('Updated fngrqst:', updatedFngrqst);
    res.status(200).json(updatedFngrqst);
  } catch (error) {
    console.error('Error updating fngrqst:', error);
    res.status(500).json({ error: 'Could not update fngrqst' });
  } finally {
    await prisma.$disconnect();
  }
};










// get pdf report

export const getPdfReportById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    // Fetch the fngrqst record by ID
    const fngrqst = await prisma.fngrqst.findUnique({
      where: { id },
    });

    // Check if the fngrqst record exists
    if (!fngrqst) {
      return res.status(404).json({ error: 'Fngrqst not found' });
    }

    // If ceoapproval is true, generate PDF using Puppeteer
    if (fngrqst.ceoapproval) {
      const fullName = `${fngrqst.fname} ${fngrqst.mname} ${fngrqst.lname}`;

      const browser = await puppeteer.launch();
      const page = await browser.newPage();

      await page.setContent(`
        <h1 style="text-align: center; font-weight: bold;">IT Staff Request</h1>
        <p style="text-align: center;">
          Job ID: ${fngrqst.ujobid}<br/>
          Full Name: ${fullName}<br/>
          Department: ${fngrqst.dept}<br/>
          Sender Sign: ${fngrqst.sendersign}
        </p>
        <div style="text-align: center;">
          <svg width="100" height="100">
            <rect x="10" y="10" width="80" height="80" stroke="blue" fill="none"/>
          </svg>
          <p style="font-family: sans-serif; text-align: center;">Rania B.</p>
        </div>
      `);

      const pdfBuffer = await page.pdf({ format: 'A4' });

      await browser.close();

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=fngrqst_report.pdf');

      res.send(pdfBuffer);

      return;
    }

    // If ceoapproval is false, respond with error message
    res.status(400).json({ error: 'PDF report not found for this Fngrqst' });
  } catch (error) {
    console.error('Error fetching PDF report:', error);
    res.status(500).json({ error: 'Could not fetch PDF report' });
  }
};

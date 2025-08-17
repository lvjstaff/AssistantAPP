type UserRole = 'client' | 'lvj_admin' | 'lvj_team' | 'lvj_marketing' | 'lawyer_admin' | 'lawyer_associate' | 'lawyer_assistant';
type Language = 'en' | 'ar' | 'pt';
type VisaType = string;
type CaseStatus = string;

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  try {
    // Create test users for all 7 roles
    const users = [
      {
        email: 'john@doe.com',
        role: 'LVJ_ADMIN' as UserRole,
        firstName: 'John',
        lastName: 'Doe',
        phone: '+351987654321',
        preferredLanguage: 'EN' as Language
      },
      {
        email: 'admin@lvj.com',
        role: 'LVJ_ADMIN' as UserRole,
        firstName: 'LVJ',
        lastName: 'Administrator',
        phone: '+351987654322',
        preferredLanguage: 'EN' as Language
      },
      {
        email: 'team@lvj.com',
        role: 'LVJ_TEAM' as UserRole,
        firstName: 'Team',
        lastName: 'Member',
        phone: '+351987654323',
        preferredLanguage: 'EN' as Language
      },
      {
        email: 'marketing@lvj.com',
        role: 'LVJ_MARKETING' as UserRole,
        firstName: 'Marketing',
        lastName: 'Manager',
        phone: '+351987654324',
        preferredLanguage: 'EN' as Language
      },
      {
        email: 'lawyer@firm.com',
        role: 'LAWYER_ADMIN' as UserRole,
        firstName: 'Legal',
        lastName: 'Director',
        phone: '+351987654325',
        preferredLanguage: 'EN' as Language
      },
      {
        email: 'associate@firm.com',
        role: 'LAWYER_ASSOCIATE' as UserRole,
        firstName: 'Legal',
        lastName: 'Associate',
        phone: '+351987654326',
        preferredLanguage: 'EN' as Language
      },
      {
        email: 'assistant@firm.com',
        role: 'LAWYER_ASSISTANT' as UserRole,
        firstName: 'Legal',
        lastName: 'Assistant',
        phone: '+351987654327',
        preferredLanguage: 'EN' as Language
      },
      {
        email: 'client@example.com',
        role: 'CLIENT' as UserRole,
        firstName: 'Maria',
        lastName: 'Silva',
        phone: '+351987654328',
        preferredLanguage: 'PT' as Language
      },
      {
        email: 'client2@example.com',
        role: 'CLIENT' as UserRole,
        firstName: 'Ahmed',
        lastName: 'Hassan',
        phone: '+971501234567',
        preferredLanguage: 'AR' as Language
      }
    ];

    // Create users
    const createdUsers = [];
    for (const userData of users) {
      const user = await prisma.user.upsert({
        where: { email: userData.email },
        update: userData,
        create: userData
      });
      createdUsers.push(user);
      console.log(`✅ Created/updated user: ${user.email} (${user.role})`);
    }

    // Find specific users for relationships
    const adminUser = createdUsers.find(u => u.email === 'admin@lvj.com');
    const teamUser = createdUsers.find(u => u.email === 'team@lvj.com');
    const lawyerUser = createdUsers.find(u => u.email === 'lawyer@firm.com');
    const client1 = createdUsers.find(u => u.email === 'client@example.com');
    const client2 = createdUsers.find(u => u.email === 'client2@example.com');

    // Create document types for different visa types
    const documentTypes = [
      // Tourist visa documents
      {
        visaType: 'TOURIST' as VisaType,
        documentKey: 'passport',
        nameEn: 'Valid Passport',
        nameAr: 'جواز سفر صالح',
        namePt: 'Passaporte Válido',
        descriptionEn: 'Valid passport with at least 6 months validity',
        isRequired: true,
        category: 'START_APPLICATION' as const,
        displayOrder: 1
      },
      {
        visaType: 'TOURIST' as VisaType,
        documentKey: 'bank_statement',
        nameEn: 'Bank Statement',
        nameAr: 'كشف الحساب البنكي',
        namePt: 'Extrato Bancário',
        descriptionEn: 'Bank statement for the last 3 months',
        isRequired: true,
        category: 'START_APPLICATION' as const,
        displayOrder: 2
      },
      {
        visaType: 'TOURIST' as VisaType,
        documentKey: 'hotel_booking',
        nameEn: 'Hotel Booking',
        nameAr: 'حجز الفندق',
        namePt: 'Reserva de Hotel',
        descriptionEn: 'Hotel booking confirmation',
        isRequired: false,
        category: 'VFS_APPOINTMENT' as const,
        displayOrder: 3
      },
      // Work visa documents
      {
        visaType: 'WORK' as VisaType,
        documentKey: 'passport',
        nameEn: 'Valid Passport',
        nameAr: 'جواز سفر صالح',
        namePt: 'Passaporte Válido',
        descriptionEn: 'Valid passport with at least 6 months validity',
        isRequired: true,
        category: 'START_APPLICATION' as const,
        displayOrder: 1
      },
      {
        visaType: 'WORK' as VisaType,
        documentKey: 'work_contract',
        nameEn: 'Work Contract',
        nameAr: 'عقد العمل',
        namePt: 'Contrato de Trabalho',
        descriptionEn: 'Signed employment contract',
        isRequired: true,
        category: 'START_APPLICATION' as const,
        displayOrder: 2
      }
    ];

    for (const docType of documentTypes) {
      await prisma.documentType.upsert({
        where: {
          visaType_documentKey: {
            visaType: docType.visaType,
            documentKey: docType.documentKey
          }
        },
        update: docType,
        create: docType
      });
    }
    console.log('✅ Created document types');

    // Create test cases
    if (client1 && client2 && teamUser && lawyerUser) {
      const cases = [
        {
          clientId: client1.id,
          caseManagerId: teamUser.id,
          lawyerId: lawyerUser.id,
          caseNumber: 'LVJ-2025-001001',
          visaType: 'TOURIST' as VisaType,
          destinationCountry: 'Portugal',
          urgencyLevel: 'STANDARD' as const,
          overallStatus: 'DOCUMENT_COLLECTION' as CaseStatus,
          completionPercentage: 25,
          totalFee: 150.00,
          currency: 'EUR'
        },
        {
          clientId: client2.id,
          caseManagerId: teamUser.id,
          caseNumber: 'LVJ-2025-001002',
          visaType: 'WORK' as VisaType,
          destinationCountry: 'Portugal',
          urgencyLevel: 'URGENT' as const,
          overallStatus: 'REVIEW' as CaseStatus,
          completionPercentage: 60,
          totalFee: 300.00,
          currency: 'EUR'
        }
      ];

      for (const caseData of cases) {
        const createdCase = await prisma.case.upsert({
          where: { caseNumber: caseData.caseNumber },
          update: caseData,
          create: caseData
        });

        // Create journey stages for each case
        const stages = [
          { key: 'intake', title: 'Initial Intake', order: 1, status: 'COMPLETED' as const },
          { key: 'documents', title: 'Document Collection', order: 2, status: 'IN_PROGRESS' as const },
          { key: 'review', title: 'Document Review', order: 3, status: 'NOT_STARTED' as const },
          { key: 'payment', title: 'Payment Processing', order: 4, status: 'NOT_STARTED' as const },
          { key: 'vfs', title: 'VFS Appointment', order: 5, status: 'NOT_STARTED' as const },
          { key: 'submission', title: 'Application Submission', order: 6, status: 'NOT_STARTED' as const },
          { key: 'processing', title: 'Processing', order: 7, status: 'NOT_STARTED' as const },
          { key: 'decision', title: 'Decision', order: 8, status: 'NOT_STARTED' as const }
        ];

        for (const stage of stages) {
          await prisma.journeyStage.upsert({
            where: {
              caseId_stageKey: {
                caseId: createdCase.id,
                stageKey: stage.key
              }
            },
            update: {
              title: stage.title,
              stageOrder: stage.order,
              status: stage.status
            },
            create: {
              caseId: createdCase.id,
              stageKey: stage.key,
              title: stage.title,
              stageOrder: stage.order,
              status: stage.status,
              ownerRole: stage.order <= 2 ? 'CLIENT' : 'LVJ_TEAM'
            }
          });
        }

        console.log(`✅ Created case: ${createdCase.caseNumber}`);
      }

      // Create some test payments
      const case1 = await prisma.case.findUnique({ where: { caseNumber: 'LVJ-2025-001001' } });
      if (case1) {
        await prisma.payment.upsert({
          where: { id: 'payment-1' },
          update: {},
          create: {
            id: 'payment-1',
            caseId: case1.id,
            title: 'Visa Processing Fee',
            description: 'Initial visa processing and document review fee',
            amount: 150.00,
            currency: 'EUR',
            status: 'PENDING',
            paymentMethod: 'ONLINE',
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
          }
        });
      }

      // Create some test tasks
      if (case1) {
        await prisma.task.upsert({
          where: { id: 'task-1' },
          update: {},
          create: {
            id: 'task-1',
            caseId: case1.id,
            title: 'Follow up with client on missing documents',
            description: 'Client needs to upload bank statement',
            taskType: 'CLIENT_CONTACT',
            assignedTo: teamUser.id,
            createdBy: teamUser.id,
            status: 'PENDING',
            priority: 'NORMAL',
            dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days from now
          }
        });
      }
    }

    console.log('🎉 Database seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

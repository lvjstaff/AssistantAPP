import { PrismaClient, Role, VisaType, CaseStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');
  try {
    const users = [
      { email: 'john@doe.com', name: 'John Doe', role: Role.ADMIN, phone: '+351987654321', preferredLanguage: 'EN' },
      { email: 'admin@lvj.com', name: 'LVJ Administrator', role: Role.ADMIN, phone: '+351987654322', preferredLanguage: 'EN' },
      { email: 'team@lvj.com', name: 'Team Member', role: Role.STAFF, phone: '+351987654323', preferredLanguage: 'EN' },
      { email: 'marketing@lvj.com', name: 'Marketing Manager', role: Role.STAFF, phone: '+351987654324', preferredLanguage: 'EN' },
      { email: 'lawyer@firm.com', name: 'Legal Director', role: Role.STAFF, phone: '+351987654325', preferredLanguage: 'EN' },
      { email: 'associate@firm.com', name: 'Legal Associate', role: Role.STAFF, phone: '+351987654326', preferredLanguage: 'EN' },
      { email: 'assistant@firm.com', name: 'Legal Assistant', role: Role.STAFF, phone: '+351987654327', preferredLanguage: 'EN' },
      { email: 'client@example.com', name: 'Maria Silva', role: Role.CLIENT, phone: '+351987654328', preferredLanguage: 'PT' },
      { email: 'client2@example.com', name: 'Ahmed Hassan', role: Role.CLIENT, phone: '+971501234567', preferredLanguage: 'AR' }
    ];

    const createdUsers = [];
    for (const userData of users) {
      const user = await prisma.user.upsert({
        where: { email: userData.email },
        update: {},
        create: userData
      });
      createdUsers.push(user);
      console.log(`✅ Created/updated user: ${user.email} (${user.role})`);
    }
    
    // Find users for relationships
    const teamUser = createdUsers.find(u => u.email === 'team@lvj.com');
    const lawyerUser = createdUsers.find(u => u.email === 'lawyer@firm.com');
    const client1 = createdUsers.find(u => u.email === 'client@example.com');
    const client2 = createdUsers.find(u => u.email === 'client2@example.com');

    if (client1 && client2 && teamUser && lawyerUser) {
        const cases = [
          {
            title: `Visa Application for ${client1.name}`,
            applicantName: client1.name || '',
            applicantEmail: client1.email,
            client: { connect: { id: client1.id } },
            caseManager: { connect: { id: teamUser.id } },
            lawyer: { connect: { id: lawyerUser.id } },
            caseNumber: 'LVJ-2025-001001',
            visaType: VisaType.TOURIST,
            destinationCountry: 'Portugal',
            urgencyLevel: 'STANDARD',
            overallStatus: 'DOCUMENT_COLLECTION',
            completionPercentage: 25,
            totalFee: 150.00,
            currency: 'EUR'
          },
          {
            title: `Work Visa for ${client2.name}`,
            applicantName: client2.name || '',
            applicantEmail: client2.email,
            client: { connect: { id: client2.id } },
            caseManager: { connect: { id: teamUser.id } },
            caseNumber: 'LVJ-2025-001002',
            visaType: VisaType.WORK,
            destinationCountry: 'Portugal',
            urgencyLevel: 'URGENT',
            overallStatus: 'REVIEW',
            completionPercentage: 60,
            totalFee: 300.00,
            currency: 'EUR'
          }
        ];

        for (const caseData of cases) {
            await prisma.case.upsert({
                where: { caseNumber: caseData.caseNumber },
                update: caseData,
                create: caseData
            });
            console.log(`✅ Created/updated case: ${caseData.caseNumber}`);
        }
    }
    
    console.log('🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();


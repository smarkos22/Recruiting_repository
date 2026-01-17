import {
  createSchool,
  createPlayer,
  createCoach,
  createStaff,
  getAllSchools,
  getAllPeople,
  createExternalNILDeal,
  createInstitutionalAllocation,
  createFundingPool,
} from './storage';
import { SchoolType, Position, CoachSpecialty, StaffSpecialty } from '../types/database';

export async function seedSampleData(): Promise<void> {
  // Check if data already exists
  const existingSchools = await getAllSchools();
  const existingPeople = await getAllPeople();

  if (existingSchools.length > 0 || existingPeople.length > 0) {
    console.log('Sample data already exists, skipping seed');
    return;
  }

  console.log('Seeding sample data...');

  // Create schools
  const lincolnHS = await createSchool({
    name: 'Lincoln High School',
    city: 'Los Angeles',
    state: 'CA',
    type: [SchoolType.HIGH_SCHOOL],
  });

  const centralHS = await createSchool({
    name: 'Central High',
    city: 'Miami',
    state: 'FL',
    type: [SchoolType.HIGH_SCHOOL],
  });

  const stateU = await createSchool({
    name: 'State University',
    city: 'Austin',
    state: 'TX',
    type: [SchoolType.DIVISION_I],
  });

  const columbiaU = await createSchool({
    name: 'Columbia University',
    city: 'New York',
    state: 'NY',
    type: [SchoolType.DIVISION_I],
  });

  // Create coaches first (so we can assign them to players)
  const coachAlvarez = await createCoach({
    person: {
      first_name: 'Carlos',
      last_name: 'Alvarez',
      email: 'calvarez@central.edu',
      phone: '(555) 123-4567',
      type: 'coach',
      school_id: centralHS.record_id,
    },
    coach: {
      specialty: [CoachSpecialty.OFFENSE, CoachSpecialty.QBS],
      committed_salary: 85000,
      estimated_salary: 85000,
    },
  });

  const coachJohnson = await createCoach({
    person: {
      first_name: 'Mike',
      last_name: 'Johnson',
      email: 'mjohnson@columbia.edu',
      phone: '(555) 234-5678',
      type: 'coach',
      school_id: columbiaU.record_id,
    },
    coach: {
      specialty: [CoachSpecialty.DEFENSE, CoachSpecialty.SECONDARY],
      committed_salary: 120000,
      estimated_salary: 120000,
    },
  });

  // Create players
  const marcusJohnson = await createPlayer({
    person: {
      first_name: 'Marcus',
      last_name: 'Johnson',
      email: 'marcus.j@email.com',
      phone: '(555) 111-2222',
      twitter_url: 'https://twitter.com/marcusj',
      instagram_url: 'https://instagram.com/marcusj',
      type: 'player',
      school_id: lincolnHS.record_id,
      assigned_coach_id: coachJohnson.record_id,
    },
    player: {
      position: [Position.QB],
      grad_year: 2025,
      years_eligibility: 4,
      priority: 5,
      likelihood: 4,
    },
    rating: {
      maxpreps: 4,
      rating_247: 4,
      composite_247: 92.1,
      internal_rating: 5,
    },
  });

  // Add NIL deals for Marcus - high school player with only estimated external NIL
  await createExternalNILDeal({
    player_id: marcusJohnson.record_id,
    source_type: 'collective',
    estimated_amount: 50000,
    deliverables_required: false,
  });

  const tylerDavis = await createPlayer({
    person: {
      first_name: 'Tyler',
      last_name: 'Davis',
      email: 'tyler.d@email.com',
      twitter_url: 'https://twitter.com/tdavis',
      instagram_url: 'https://instagram.com/tdavis',
      type: 'player',
      school_id: stateU.record_id,
    },
    player: {
      position: [Position.WR],
      grad_year: 2024,
      years_eligibility: 2,
      priority: 4,
      likelihood: 3,
    },
    rating: {
      maxpreps: 3,
      rating_247: 3,
      composite_247: 87.4,
      internal_rating: 4,
    },
  });

  // Tyler has both institutional allocation and external NIL
  await createInstitutionalAllocation({
    player_id: tylerDavis.record_id,
    allocation_type: 'baseline',
    annual_amount: 25000,
    team_id: 'Football',
    recruiting_cycle_id: '2024',
    counts_toward_cap: true,
    status: 'active',
  });

  await createExternalNILDeal({
    player_id: tylerDavis.record_id,
    source_type: 'brand',
    estimated_amount: 35000,
    deliverables_required: true,
  });

  const derekWilliams = await createPlayer({
    person: {
      first_name: 'Derek',
      last_name: 'Williams',
      email: 'derek.w@email.com',
      phone: '(555) 333-4444',
      type: 'player',
      school_id: centralHS.record_id,
      assigned_coach_id: coachAlvarez.record_id,
    },
    player: {
      position: [Position.RB],
      grad_year: 2025,
      years_eligibility: 4,
      priority: 5,
      likelihood: 5,
    },
    rating: {
      maxpreps: 5,
      rating_247: 5,
      composite_247: 96.5,
      internal_rating: 5,
    },
  });

  // Derek - 5-star recruit with institutional allocation committed
  await createInstitutionalAllocation({
    player_id: derekWilliams.record_id,
    allocation_type: 'recruiting',
    annual_amount: 75000,
    team_id: 'Football',
    recruiting_cycle_id: '2025',
    counts_toward_cap: true,
    status: 'approved',
  });

  const leahChen = await createPlayer({
    person: {
      first_name: 'Leah',
      last_name: 'Chen',
      email: 'leah.chen@email.com',
      instagram_url: 'https://instagram.com/leahchen',
      type: 'player',
      school_id: stateU.record_id,
    },
    player: {
      position: [Position.CB, Position.S],
      grad_year: 2024,
      years_eligibility: 1,
      priority: 3,
      likelihood: 3,
    },
    rating: {
      maxpreps: 4,
      rating_247: 4,
      composite_247: 90.2,
      internal_rating: 4,
    },
  });

  // Leah - marketplace deal only
  await createExternalNILDeal({
    player_id: leahChen.record_id,
    source_type: 'marketplace',
    estimated_amount: 30000,
    deliverables_required: true,
  });

  const jordanPrice = await createPlayer({
    person: {
      first_name: 'Jordan',
      last_name: 'Price',
      email: 'jprice@email.com',
      twitter_url: 'https://twitter.com/jprice',
      type: 'player',
      school_id: stateU.record_id,
    },
    player: {
      position: [Position.WR, Position.ATH],
      grad_year: 2026,
      years_eligibility: 4,
      priority: 4,
      likelihood: 2,
    },
    rating: {
      rating_247: 4,
      composite_247: 88.3,
      internal_rating: 3,
    },
  });

  // Jordan - collective deal for recruiting
  await createExternalNILDeal({
    player_id: jordanPrice.record_id,
    source_type: 'collective',
    estimated_amount: 40000,
    deliverables_required: false,
  });

  // Create staff
  await createStaff({
    person: {
      first_name: 'Sarah',
      last_name: 'Martinez',
      email: 'smartinez@columbia.edu',
      phone: '(555) 555-6789',
      type: 'staff',
      school_id: columbiaU.record_id,
    },
    staff: {
      specialty: [StaffSpecialty.RECRUITING, StaffSpecialty.OPERATIONS],
    },
  });

  await createStaff({
    person: {
      first_name: 'James',
      last_name: 'Thompson',
      email: 'jthompson@central.edu',
      phone: '(555) 666-7890',
      type: 'staff',
      school_id: centralHS.record_id,
    },
    staff: {
      specialty: [StaffSpecialty.FINANCE, StaffSpecialty.ADMIN],
    },
  });

  // Create funding pools for budget tracking
  await createFundingPool({
    team_id: 'Football',
    recruiting_cycle_id: '2024',
    pool_type: 'revenue_share',
    total_amount: 500000,
    allocated_amount: 25000, // Tyler Davis allocation
    cap_type: 'hard',
  });

  await createFundingPool({
    team_id: 'Football',
    recruiting_cycle_id: '2025',
    pool_type: 'revenue_share',
    total_amount: 750000,
    allocated_amount: 75000, // Derek Williams allocation
    cap_type: 'hard',
  });

  await createFundingPool({
    team_id: 'Football',
    recruiting_cycle_id: '2025',
    pool_type: 'retention_pool',
    total_amount: 300000,
    allocated_amount: 0,
    cap_type: 'soft',
  });

  console.log('Sample data seeded successfully!');
}

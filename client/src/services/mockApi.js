// Mock data service — simulates backend API calls
// All data is local until backend is ready

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ==================== MOCK DATA ====================

const mockUsers = [
  { user_id: 1, name: 'Taj Hotel Mumbai', role: 'DONOR', phone: '9876543210', email: 'taj@demo.com', trust_score: 8.5, is_active: true, address: 'Colaba, Mumbai', created_at: '2026-01-15T10:00:00' },
  { user_id: 2, name: 'Akshaya Patra Foundation', role: 'RECEIVER', phone: '9876543211', email: 'akshaya@demo.com', trust_score: 9.0, is_active: true, address: 'Hubli, Karnataka', created_at: '2026-01-10T09:00:00' },
  { user_id: 3, name: 'Rahul Volunteer', role: 'VOLUNTEER', phone: '9876543212', email: 'rahul@demo.com', trust_score: 7.5, is_active: true, address: 'Andheri, Mumbai', created_at: '2026-02-01T08:00:00' },
  { user_id: 4, name: 'Admin User', role: 'ADMIN', phone: '9876543213', email: 'admin@demo.com', trust_score: 10.0, is_active: true, address: 'HQ', created_at: '2026-01-01T00:00:00' },
  { user_id: 5, name: 'McDonald\'s Delhi', role: 'DONOR', phone: '9876543214', email: 'mcdonalds@demo.com', trust_score: 7.0, is_active: true, address: 'Connaught Place, Delhi', created_at: '2026-02-10T11:00:00' },
  { user_id: 6, name: 'Robin Hood Army', role: 'RECEIVER', phone: '9876543215', email: 'rha@demo.com', trust_score: 8.8, is_active: true, address: 'Bandra, Mumbai', created_at: '2026-01-20T07:00:00' },
  { user_id: 7, name: 'Priya Delivery', role: 'VOLUNTEER', phone: '9876543216', email: 'priya@demo.com', trust_score: 6.5, is_active: true, address: 'Powai, Mumbai', created_at: '2026-03-01T08:00:00' },
  { user_id: 8, name: 'ITC Grand Chola', role: 'DONOR', phone: '9876543217', email: 'itc@demo.com', trust_score: 9.2, is_active: true, address: 'Guindy, Chennai', created_at: '2026-01-25T10:00:00' },
];

const now = new Date();
const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);
const oneHourLater = new Date(now.getTime() + 1 * 60 * 60 * 1000);
const thirtyMinsLater = new Date(now.getTime() + 30 * 60 * 1000);
const tenMinsLater = new Date(now.getTime() + 10 * 60 * 1000);

let mockFoodListings = [
  { food_id: 1, donor_id: 1, donor_name: 'Taj Hotel Mumbai', food_type: 'VEG', description: 'Fresh Paneer Biryani and Dal Makhani — 50 servings from lunch buffet', quantity: 50, hygiene_confirmed: true, status: 'AVAILABLE', created_at: now.toISOString(), expires_at: twoHoursLater.toISOString(), pickup_address: 'Colaba, Mumbai' },
  { food_id: 2, donor_id: 5, donor_name: 'McDonald\'s Delhi', food_type: 'NON_VEG', description: 'Chicken burgers and fries — excess from evening shift', quantity: 30, hygiene_confirmed: true, status: 'AVAILABLE', created_at: now.toISOString(), expires_at: oneHourLater.toISOString(), pickup_address: 'Connaught Place, Delhi' },
  { food_id: 3, donor_id: 8, donor_name: 'ITC Grand Chola', food_type: 'MIXED', description: 'Assorted buffet items - rice, curry, naan, salad', quantity: 80, hygiene_confirmed: true, status: 'AVAILABLE', created_at: now.toISOString(), expires_at: thirtyMinsLater.toISOString(), pickup_address: 'Guindy, Chennai' },
  { food_id: 4, donor_id: 1, donor_name: 'Taj Hotel Mumbai', food_type: 'VEG', description: 'Breakfast items — idli, dosa, chutney, sambar', quantity: 40, hygiene_confirmed: true, status: 'REQUESTED', created_at: new Date(now.getTime() - 30 * 60 * 1000).toISOString(), expires_at: oneHourLater.toISOString(), pickup_address: 'Colaba, Mumbai' },
  { food_id: 5, donor_id: 5, donor_name: 'McDonald\'s Delhi', food_type: 'VEG', description: 'McAloo Tikki burgers and hash browns', quantity: 25, hygiene_confirmed: true, status: 'ACCEPTED', created_at: new Date(now.getTime() - 45 * 60 * 1000).toISOString(), expires_at: tenMinsLater.toISOString(), pickup_address: 'Connaught Place, Delhi' },
  { food_id: 6, donor_id: 8, donor_name: 'ITC Grand Chola', food_type: 'VEG', description: 'Wedding catering surplus — sweets and snacks', quantity: 100, hygiene_confirmed: true, status: 'FULFILLED', created_at: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(), expires_at: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(), pickup_address: 'Guindy, Chennai' },
];

let mockRequests = [
  { request_id: 1, food_id: 4, receiver_id: 2, receiver_name: 'Akshaya Patra Foundation', request_status: 'PENDING', requested_at: new Date(now.getTime() - 20 * 60 * 1000).toISOString(), food_description: 'Breakfast items — idli, dosa, chutney, sambar', food_type: 'VEG', quantity: 40 },
  { request_id: 2, food_id: 5, receiver_id: 6, receiver_name: 'Robin Hood Army', request_status: 'APPROVED', requested_at: new Date(now.getTime() - 40 * 60 * 1000).toISOString(), responded_at: new Date(now.getTime() - 35 * 60 * 1000).toISOString(), food_description: 'McAloo Tikki burgers and hash browns', food_type: 'VEG', quantity: 25 },
  { request_id: 3, food_id: 6, receiver_id: 2, receiver_name: 'Akshaya Patra Foundation', request_status: 'FULFILLED', requested_at: new Date(now.getTime() - 2.5 * 60 * 60 * 1000).toISOString(), responded_at: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(), food_description: 'Wedding catering surplus — sweets and snacks', food_type: 'VEG', quantity: 100 },
];

let mockDeliveries = [
  { delivery_id: 1, request_id: 2, volunteer_id: 3, volunteer_name: 'Rahul Volunteer', status: 'ASSIGNED', assigned_at: new Date(now.getTime() - 30 * 60 * 1000).toISOString(), donor_name: 'McDonald\'s Delhi', donor_address: 'Connaught Place, Delhi', receiver_name: 'Robin Hood Army', receiver_address: 'Bandra, Mumbai', food_description: 'McAloo Tikki burgers and hash browns', quantity: 25 },
  { delivery_id: 2, request_id: 3, volunteer_id: 7, volunteer_name: 'Priya Delivery', status: 'DELIVERED', assigned_at: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(), picked_up_at: new Date(now.getTime() - 1.5 * 60 * 60 * 1000).toISOString(), delivered_at: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(), donor_name: 'ITC Grand Chola', donor_address: 'Guindy, Chennai', receiver_name: 'Akshaya Patra Foundation', receiver_address: 'Hubli, Karnataka', food_description: 'Wedding catering surplus — sweets and snacks', quantity: 100 },
];

// ==================== API SIMULATION ====================

// Auth
export async function mockLogin(email, password) {
  await delay(800);
  const user = mockUsers.find((u) => u.email === email);
  if (!user) throw new Error('Invalid credentials');
  return { user, token: 'mock-jwt-token-' + user.user_id };
}

export async function mockRegister(userData) {
  await delay(1000);
  const newUser = {
    user_id: mockUsers.length + 1,
    ...userData,
    trust_score: 5.0,
    is_active: true,
    created_at: new Date().toISOString(),
  };
  mockUsers.push(newUser);
  return { user: newUser, token: 'mock-jwt-token-' + newUser.user_id };
}

// Food Listings
export async function getAvailableFood() {
  await delay(500);
  return mockFoodListings.filter((f) => f.status === 'AVAILABLE');
}

export async function getDonorListings(donorId) {
  await delay(500);
  return mockFoodListings.filter((f) => f.donor_id === donorId);
}

export async function createFoodListing(data) {
  await delay(800);
  const now = new Date();
  const newListing = {
    food_id: mockFoodListings.length + 1,
    ...data,
    status: 'AVAILABLE',
    hygiene_confirmed: true,
    created_at: now.toISOString(),
    expires_at: new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString(),
  };
  mockFoodListings.push(newListing);
  return newListing;
}

// Requests
export async function claimFood(foodId, receiverId) {
  await delay(800);
  const listing = mockFoodListings.find((f) => f.food_id === foodId);
  if (!listing || listing.status !== 'AVAILABLE') throw new Error('Food is no longer available');
  listing.status = 'REQUESTED';

  const newRequest = {
    request_id: mockRequests.length + 1,
    food_id: foodId,
    receiver_id: receiverId,
    request_status: 'PENDING',
    requested_at: new Date().toISOString(),
    food_description: listing.description,
    food_type: listing.food_type,
    quantity: listing.quantity,
  };
  mockRequests.push(newRequest);
  return newRequest;
}

export async function getDonorRequests(donorId) {
  await delay(500);
  const donorFoodIds = mockFoodListings.filter((f) => f.donor_id === donorId).map((f) => f.food_id);
  return mockRequests.filter((r) => donorFoodIds.includes(r.food_id));
}

export async function getReceiverRequests(receiverId) {
  await delay(500);
  return mockRequests.filter((r) => r.receiver_id === receiverId);
}

export async function acceptRequest(requestId) {
  await delay(600);
  const request = mockRequests.find((r) => r.request_id === requestId);
  if (!request) throw new Error('Request not found');
  request.request_status = 'APPROVED';
  request.responded_at = new Date().toISOString();
  const listing = mockFoodListings.find((f) => f.food_id === request.food_id);
  if (listing) listing.status = 'ACCEPTED';
  return request;
}

export async function rejectRequest(requestId) {
  await delay(600);
  const request = mockRequests.find((r) => r.request_id === requestId);
  if (!request) throw new Error('Request not found');
  request.request_status = 'REJECTED';
  request.responded_at = new Date().toISOString();
  const listing = mockFoodListings.find((f) => f.food_id === request.food_id);
  if (listing) listing.status = 'AVAILABLE';
  return request;
}

// Deliveries
export async function getVolunteerTasks(volunteerId) {
  await delay(500);
  return mockDeliveries.filter((d) => d.volunteer_id === volunteerId);
}

export async function getAvailableTasks() {
  await delay(500);
  return mockDeliveries.filter((d) => d.status === 'ASSIGNED');
}

export async function confirmPickup(deliveryId) {
  await delay(600);
  const delivery = mockDeliveries.find((d) => d.delivery_id === deliveryId);
  if (!delivery) throw new Error('Delivery not found');
  delivery.status = 'PICKED_UP';
  delivery.picked_up_at = new Date().toISOString();
  return delivery;
}

export async function confirmDelivery(deliveryId) {
  await delay(600);
  const delivery = mockDeliveries.find((d) => d.delivery_id === deliveryId);
  if (!delivery) throw new Error('Delivery not found');
  delivery.status = 'DELIVERED';
  delivery.delivered_at = new Date().toISOString();
  // Also fulfill the request and listing
  const request = mockRequests.find((r) => r.request_id === delivery.request_id);
  if (request) request.request_status = 'FULFILLED';
  return delivery;
}

// Admin
export async function getAdminStats() {
  await delay(500);
  return {
    totalMealsSaved: 1247,
    activeDonors: mockUsers.filter((u) => u.role === 'DONOR').length,
    activeReceivers: mockUsers.filter((u) => u.role === 'RECEIVER').length,
    activeVolunteers: mockUsers.filter((u) => u.role === 'VOLUNTEER').length,
    totalListings: mockFoodListings.length,
    availableNow: mockFoodListings.filter((f) => f.status === 'AVAILABLE').length,
    fulfilledToday: mockFoodListings.filter((f) => f.status === 'FULFILLED').length,
    co2Saved: 312.5,
    trustIssues: 2,
  };
}

export async function getAllUsers() {
  await delay(500);
  return mockUsers;
}

export async function getTrustLogs() {
  await delay(500);
  return [
    { log_id: 1, user_id: 1, user_name: 'Taj Hotel Mumbai', action: 'DONATION_COMPLETE', delta: 0.25, new_score: 8.5, created_at: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString() },
    { log_id: 2, user_id: 3, user_name: 'Rahul Volunteer', action: 'DELIVERY_COMPLETE', delta: 0.25, new_score: 7.5, created_at: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString() },
    { log_id: 3, user_id: 7, user_name: 'Priya Delivery', action: 'NO_SHOW', delta: -0.5, new_score: 6.5, created_at: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString() },
    { log_id: 4, user_id: 2, user_name: 'Akshaya Patra Foundation', action: 'PICKUP_COMPLETE', delta: 0.25, new_score: 9.0, created_at: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString() },
  ];
}

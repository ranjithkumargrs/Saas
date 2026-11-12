export const navigation = [
  { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
  { label: 'Analytics', path: '/analytics', icon: 'ChartNoAxesColumn' },
  { label: 'Invoice', path: '/invoice', icon: 'PanelsTopLeft' },
  { label: 'Schedule', path: '/schedule', icon: 'ListTodo' },
  { label: 'Calendar', path: '/calendar', icon: 'CalendarDays' },
  { label: 'Messages', path: '/messages', icon: 'ChartNoAxesCombined', badge: '49' },
  { label: 'Notification', path: '/notifications', icon: 'Bell' },
  { label: 'Settings', path: '/settings', icon: 'Settings' },
]

export const orders = [
  { id: '#876364', name: 'Camera Lens', price: '$178', count: '325', amount: '$1,46,660' },
  { id: '#876368', name: 'Black Sleep Dress', price: '$14', count: '53', amount: '$46,660' },
  { id: '#876412', name: 'Argan Oil', price: '$21', count: '78', amount: '$3,46,676' },
  { id: '#876621', name: 'EAU DE Parfum', price: '$32', count: '98', amount: '$3,46,981' },
]

export const invoices = [
  ['#876364', 'Arrora gaur', 'arroragaur@gmail.com', '12 Dec, 2020', 'Complete'],
  ['#876123', 'James Mullican', 'jamesmullican@gmail.com', '10 Dec, 2020', 'Pending'],
  ['#876213', 'Robert Bacins', 'robertbacins4182@.com', '09 Dec, 2020', 'Complete'],
  ['#876987', 'Bethany Jackson', 'bethanyjackson@gmail.com', '09 Dec, 2020', 'Cancel'],
  ['#871345', 'Anne Jacob', 'annejacob@gmail.com', '10 Dec, 2020', 'Complete'],
  ['#872345', 'Bethany jackson', 'bethanyjackson@gmail.com', '10 Dec, 2020', 'Pending'],
  ['#872346', 'James Mullican', 'jamesmullican@gmail.com', '10 Dec, 2020', 'Complete'],
  ['#873245', 'Jhon Deo', 'jhondeo32@gmail.com', '08 Dec, 2020', 'Complete'],
  ['#876364', 'Bethany jackson', 'bethanyjackson@gmail.com', '02 Dec, 2020', 'Cancel'],
  ['#878769', 'James Mullican', 'jamesmullican@gmail.com', '01 Dec, 2020', 'Pending'],
].map(([id, name, email, date, status], index) => ({
  key: `invoice-${index}`,
  id,
  name,
  email,
  date,
  status,
  avatarIndex: index,
  selected: [2, 3, 5, 9].includes(index),
  favorite: [0, 1, 5, 7, 8].includes(index),
}))

export const customers = [
  { name: 'John Deo', email: 'johndeo2211@gmail.com', phone: '+33757005467', gender: 'Male' },
  { name: 'Shelby Goode', email: 'shelbygoode481@gmail.com', phone: '+33757005467', gender: 'Female' },
  { name: 'Robert Bacins', email: 'robertbacins4182@.com', phone: '+33757005467', gender: 'Male' },
  { name: 'John Carilo', email: 'john.carilo182@.com', phone: '+33757805467', gender: 'Male' },
  { name: 'Adriene Watson', email: 'adrienewatson82@.com', phone: '+83757305467', gender: 'Female' },
  { name: 'Mark Ruffalo', email: 'markruffalo3735@.com', phone: '+33757005467', gender: 'Male' },
  { name: 'Bethany Jackson', email: 'bethanyjackson5@.com', phone: '+33757005467', gender: 'Female' },
  { name: 'Christine Huston', email: 'christinehuston4@.com', phone: '+33757005467', gender: 'Male' },
  { name: 'Anne Jacob', email: 'annejacob2@ummoh.com', phone: '+33757005467', gender: 'Male' },
  { name: 'James Mullican', email: 'jamesmullican5346@.com', phone: '+33757005467', gender: 'Male' },
]

export const schedules = [
  ['12 Dec, 2021', '10.15AM', 'Office Meeting', 'eddie'],
  ['10 Dec, 2021', '11.20AM', 'Home', 'alexey'],
  ['09 Dec, 2021', '11.45AM', 'Friends Zone', 'anton'],
  ['08 Dec, 2021', '12.15PM', 'Office Meeting', 'eddie'],
  ['07 Dec, 2021', '01.20PM', 'Home', 'alexey'],
  ['05 Dec, 2021', '10.15AM', 'Meeting Outside', 'anton'],
  ['04 Dec, 2021', '11.15AM', 'Office Meeting', 'eddie'],
  ['04 Dec, 2021', '01.25PM', 'Home', 'alexey'],
  ['02 Dec, 2021', '10.15AM', 'Friends', 'anton'],
  ['01 Dec, 2021', '04.30PM', 'Meeting Outside', 'eddie'],
].map(([date, time, location, personId], index) => ({ id: `schedule-${index}`, date, time, location, personId }))

export const schedulePeople = [
  { id: 'eddie', name: 'Eddie Lobanovskiy', email: 'lobanovskiy@gmail.com' },
  { id: 'alexey', name: 'Alexey Stave', email: 'alexeyst@gmail.com' },
  { id: 'anton', name: 'Anton Tkacheve', email: 'tkacheveanton@gmail.com' },
]

export const taskNames = ['UI Design', 'Logo Design', 'Graphic Design', 'Web Design', 'Dashboard Design', 'E-Shop Mobile App']

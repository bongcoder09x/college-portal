/**
 * College identity lives here. Edit these values once and the whole site follows.
 */
export const site = {
  name: "Model Degree College",
  shortName: "MDC",
  tagline: "Knowledge, character and service",
  established: 1962,
  address: "College Road, P.O. Model Town, Dist. Nadia, West Bengal 741101",
  phone: "+91 3472 000 000",
  email: "office@modeldegreecollege.edu.in",
  affiliation: "Affiliated to the State University",
  nav: [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/courses", label: "Courses" },
    { href: "/faculty", label: "Faculty" },
    { href: "/notices", label: "Notices" },
    { href: "/contact", label: "Contact" },
  ],
};

export const gradeScale = [
  { min: 90, grade: "O", points: 10 },
  { min: 80, grade: "A+", points: 9 },
  { min: 70, grade: "A", points: 8 },
  { min: 60, grade: "B+", points: 7 },
  { min: 50, grade: "B", points: 6 },
  { min: 40, grade: "C", points: 5 },
  { min: 0, grade: "F", points: 0 },
];

export function gradeFor(percentage: number) {
  return gradeScale.find((g) => percentage >= g.min) ?? gradeScale[gradeScale.length - 1];
}

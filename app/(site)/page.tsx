import { getProjects, getStudio } from "@/app/lib/content-store";
import Home from "./home";

/**
 * Server entry for the homepage. The visual layer lives in home.tsx as a Client
 * Component (scroll parallax, pointer parallax, the marquee), so the data read
 * has to happen here and be handed down as props.
 *
 * Admin edits reach this page through revalidatePath("/") in the work and
 * settings actions.
 */
export default async function HomePage() {
    const [projects, studio] = await Promise.all([getProjects(), getStudio()]);

    return <Home projects={projects} studio={studio} />;
}

import { currentUser } from "@/modules/authentication/actions";
import UserButton from "@/modules/authentication/components/user-button";

export default async function Home() {
  const user = await currentUser();
  return (
    <div className="flex flex-col flex-1 items-center justify-center font-sans">
      <div className="">
        Hello World
      </div>
    </div>
  );
}

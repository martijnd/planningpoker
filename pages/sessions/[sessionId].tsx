import { useRouter } from "next/router";

export default function Session() {
  const router = useRouter();
  const { sessionId } = router.query;

  console.log({ sessionId });
}

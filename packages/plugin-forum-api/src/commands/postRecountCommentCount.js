const dotenv = require("dotenv");

dotenv.config();

const { Collection, Db, MongoClient } = require("mongodb");

const { MONGO_URL } = process.env;

if (!MONGO_URL) {
  throw new Error(`Environment variable MONGO_URL not set.`);
}

const client = new MongoClient(MONGO_URL, { useUnifiedTopology: true });

const main = async () => {
  await client.connect();

  const db = client.db();
  const Comment = await db.collection("forum_comments");
  const Post = await db.collection("forum_posts");

  const postsCursor = Post.find({}).project({ _id: 1 });

  for await (const post of postsCursor) {
    const commentCount = await Comment.countDocuments({ postId: post._id });
    await Post.updateOne({ _id: post._id }, { $set: { commentCount } });
  }

  await client.close();
};

main();

package org.jarsonmar.awesomud.world;

import java.util.HashMap;
import java.util.List;
import java.util.Set;
import java.util.Timer;

import redis.clients.jedis.Jedis;

public class WorldServer {

   public static final Timer timer = new Timer();
   private static HashMap<String, Mobile> movableMobiles;

   public static class Mobile {
      public String name;
      public String location;
      public int speed;

      @Override
      public String toString() {
         return "Mobile { name: " + name + ", location: " + location
               + ", speed: " + speed + " }";
      }
   }

   public static void listen() {
      try (Jedis jedis = new Jedis("localhost", 6379)) {
         Set<String> movables = jedis
               .smembers("org.jarsonmar.awesomud:movables");
         movableMobiles = new HashMap<>();
         for (String movable : movables) {
            List<String> properties = jedis
                  .hmget("org.jarsonmar.awesomud:mob:" + movable
                        + ":properties", "name", "speed", "location");
            Mobile m = new Mobile();
            m.name = properties.get(0);
            try {
               m.speed = Integer.parseInt(properties.get(1));
            } catch (NumberFormatException ex) {
               System.err.println("Missing speed for [" + movable + "]");
            }
            m.location = properties.get(2);
            movableMobiles.put(movable, m);
         }

         List<String> randomMobiles = jedis.srandmember(
               "org.jarsonmar.awesomud:movables", 100);
         for (String mob : randomMobiles) {
            System.err.println(movableMobiles.get(mob));
         }
         System.out.println("done. " + movableMobiles.keySet().size());
         System.exit(0);
      }
   }
}

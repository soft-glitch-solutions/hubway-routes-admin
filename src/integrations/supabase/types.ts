export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: string | null
          page_url: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          page_url?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          page_url?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      blogs: {
        Row: {
          author_id: string
          content: string
          created_at: string | null
          id: string
          published_at: string | null
          status: string
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string | null
          id?: string
          published_at?: string | null
          status?: string
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string | null
          id?: string
          published_at?: string | null
          status?: string
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      card_entries: {
        Row: {
          action: string
          amount: number
          balance_after: number
          card_id: string | null
          created_at: string | null
          date: string
          id: string
          notes: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          amount: number
          balance_after: number
          card_id?: string | null
          created_at?: string | null
          date: string
          id?: string
          notes?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          amount?: number
          balance_after?: number
          card_id?: string | null
          created_at?: string | null
          date?: string
          id?: string
          notes?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "card_entries_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "user_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      card_tracker_entries: {
        Row: {
          action: string
          amount: number
          balance_after: number
          card_type: string
          created_at: string | null
          date: string
          id: string
          notes: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          action: string
          amount: number
          balance_after: number
          card_type: string
          created_at?: string | null
          date: string
          id?: string
          notes?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          action?: string
          amount?: number
          balance_after?: number
          card_type?: string
          created_at?: string | null
          date?: string
          id?: string
          notes?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "card_tracker_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      carpool_applications: {
        Row: {
          applicant_id: string
          applied_at: string | null
          carpool_id: string
          id: string
          message: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
        }
        Insert: {
          applicant_id: string
          applied_at?: string | null
          carpool_id: string
          id?: string
          message?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
        }
        Update: {
          applicant_id?: string
          applied_at?: string | null
          carpool_id?: string
          id?: string
          message?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "carpool_applications_applicant_id_fkey"
            columns: ["applicant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "carpool_applications_carpool_id_fkey"
            columns: ["carpool_id"]
            isOneToOne: false
            referencedRelation: "carpool_clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "carpool_applications_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      carpool_clubs: {
        Row: {
          created_at: string | null
          creator_id: string
          current_members: number
          days_of_week: string[]
          description: string | null
          from_latitude: number | null
          from_location: string
          from_longitude: number | null
          id: string
          is_active: boolean | null
          is_full: boolean | null
          max_members: number
          name: string
          pickup_time: string
          price_per_trip: number | null
          price_range: string | null
          return_time: string | null
          rules: string | null
          to_latitude: number | null
          to_location: string
          to_longitude: number | null
          updated_at: string | null
          vehicle_info: string | null
        }
        Insert: {
          created_at?: string | null
          creator_id: string
          current_members?: number
          days_of_week?: string[]
          description?: string | null
          from_latitude?: number | null
          from_location: string
          from_longitude?: number | null
          id?: string
          is_active?: boolean | null
          is_full?: boolean | null
          max_members?: number
          name: string
          pickup_time: string
          price_per_trip?: number | null
          price_range?: string | null
          return_time?: string | null
          rules?: string | null
          to_latitude?: number | null
          to_location: string
          to_longitude?: number | null
          updated_at?: string | null
          vehicle_info?: string | null
        }
        Update: {
          created_at?: string | null
          creator_id?: string
          current_members?: number
          days_of_week?: string[]
          description?: string | null
          from_latitude?: number | null
          from_location?: string
          from_longitude?: number | null
          id?: string
          is_active?: boolean | null
          is_full?: boolean | null
          max_members?: number
          name?: string
          pickup_time?: string
          price_per_trip?: number | null
          price_range?: string | null
          return_time?: string | null
          rules?: string | null
          to_latitude?: number | null
          to_location?: string
          to_longitude?: number | null
          updated_at?: string | null
          vehicle_info?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "carpool_clubs_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      carpool_members: {
        Row: {
          carpool_id: string
          id: string
          is_active: boolean | null
          joined_at: string | null
          user_id: string
        }
        Insert: {
          carpool_id: string
          id?: string
          is_active?: boolean | null
          joined_at?: string | null
          user_id: string
        }
        Update: {
          carpool_id?: string
          id?: string
          is_active?: boolean | null
          joined_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "carpool_members_carpool_id_fkey"
            columns: ["carpool_id"]
            isOneToOne: false
            referencedRelation: "carpool_clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "carpool_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      deployment_logs: {
        Row: {
          changes: string[] | null
          completed_at: string | null
          created_at: string | null
          deployed_by: string | null
          id: string
          status: string
          version: string | null
        }
        Insert: {
          changes?: string[] | null
          completed_at?: string | null
          created_at?: string | null
          deployed_by?: string | null
          id?: string
          status: string
          version?: string | null
        }
        Update: {
          changes?: string[] | null
          completed_at?: string | null
          created_at?: string | null
          deployed_by?: string | null
          id?: string
          status?: string
          version?: string | null
        }
        Relationships: []
      }
      driver_journeys: {
        Row: {
          completed_at: string | null
          created_at: string | null
          current_stop_id: string | null
          driver_id: string
          id: string
          journey_id: string
          next_stop_id: string | null
          route_id: string
          started_at: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          current_stop_id?: string | null
          driver_id: string
          id?: string
          journey_id: string
          next_stop_id?: string | null
          route_id: string
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          current_stop_id?: string | null
          driver_id?: string
          id?: string
          journey_id?: string
          next_stop_id?: string | null
          route_id?: string
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "driver_journeys_current_stop_id_fkey"
            columns: ["current_stop_id"]
            isOneToOne: false
            referencedRelation: "stops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "driver_journeys_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "driver_journeys_journey_id_fkey"
            columns: ["journey_id"]
            isOneToOne: false
            referencedRelation: "journeys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "driver_journeys_next_stop_id_fkey"
            columns: ["next_stop_id"]
            isOneToOne: false
            referencedRelation: "stops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "driver_journeys_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
        ]
      }
      drivers: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          is_verified: boolean | null
          license_number: string
          rating: number | null
          total_trips: number | null
          updated_at: string | null
          user_id: string
          vehicle_registration: string
          vehicle_type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          license_number: string
          rating?: number | null
          total_trips?: number | null
          updated_at?: string | null
          user_id: string
          vehicle_registration: string
          vehicle_type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          license_number?: string
          rating?: number | null
          total_trips?: number | null
          updated_at?: string | null
          user_id?: string
          vehicle_registration?: string
          vehicle_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "drivers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          created_at: string | null
          entity_id: string
          entity_type: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          entity_id: string
          entity_type: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      help_documentation: {
        Row: {
          content: string
          created_at: string | null
          created_by: string | null
          id: string
          status: string
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          status?: string
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          status?: string
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      hub_posts: {
        Row: {
          content: string
          created_at: string | null
          hub_id: string
          id: string
          image_url: string | null
          post_images: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          hub_id: string
          id?: string
          image_url?: string | null
          post_images?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          hub_id?: string
          id?: string
          image_url?: string | null
          post_images?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hub_posts_hub_id_fkey"
            columns: ["hub_id"]
            isOneToOne: false
            referencedRelation: "hubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hub_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      hub_requests: {
        Row: {
          address: string
          created_at: string
          description: string | null
          id: string
          latitude: number
          longitude: number
          name: string
          status: string | null
          transport_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          address: string
          created_at?: string
          description?: string | null
          id?: string
          latitude: number
          longitude: number
          name: string
          status?: string | null
          transport_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string
          created_at?: string
          description?: string | null
          id?: string
          latitude?: number
          longitude?: number
          name?: string
          status?: string | null
          transport_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      hubs: {
        Row: {
          address: string | null
          created_at: string | null
          id: string
          image: string | null
          latitude: number
          longitude: number
          name: string
          transport_type: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          id?: string
          image?: string | null
          latitude: number
          longitude: number
          name: string
          transport_type?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          id?: string
          image?: string | null
          latitude?: number
          longitude?: number
          name?: string
          transport_type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      journey_messages: {
        Row: {
          created_at: string | null
          id: string
          is_anonymous: boolean | null
          journey_id: string
          message: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_anonymous?: boolean | null
          journey_id: string
          message: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_anonymous?: boolean | null
          journey_id?: string
          message?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "journey_messages_journey_id_fkey"
            columns: ["journey_id"]
            isOneToOne: false
            referencedRelation: "journeys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journey_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      journey_participants: {
        Row: {
          id: string
          is_active: boolean
          joined_at: string
          journey_id: string
          last_location_update: string | null
          latitude: number | null
          left_at: string | null
          longitude: number | null
          status: string | null
          user_id: string
        }
        Insert: {
          id?: string
          is_active?: boolean
          joined_at?: string
          journey_id: string
          last_location_update?: string | null
          latitude?: number | null
          left_at?: string | null
          longitude?: number | null
          status?: string | null
          user_id: string
        }
        Update: {
          id?: string
          is_active?: boolean
          joined_at?: string
          journey_id?: string
          last_location_update?: string | null
          latitude?: number | null
          left_at?: string | null
          longitude?: number | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "journey_participants_journey_id_fkey"
            columns: ["journey_id"]
            isOneToOne: false
            referencedRelation: "journeys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journey_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      journeys: {
        Row: {
          created_at: string | null
          current_stop_sequence: number
          driver_id: string | null
          has_driver: boolean | null
          id: string
          last_ping_time: string | null
          route_id: string
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_stop_sequence?: number
          driver_id?: string | null
          has_driver?: boolean | null
          id?: string
          last_ping_time?: string | null
          route_id: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_stop_sequence?: number
          driver_id?: string | null
          has_driver?: boolean | null
          id?: string
          last_ping_time?: string | null
          route_id?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "journeys_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journeys_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
        ]
      }
      login_streaks: {
        Row: {
          created_at: string
          current_streak: number
          id: string
          last_login: string
          max_streak: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_streak?: number
          id?: string
          last_login?: string
          max_streak?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_streak?: number
          id?: string
          last_login?: string
          max_streak?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "login_streaks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mission_progress: {
        Row: {
          created_at: string
          current_count: number
          id: string
          is_completed: boolean
          last_updated: string
          mission_id: string
          reward_claimed: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_count?: number
          id?: string
          is_completed?: boolean
          last_updated?: string
          mission_id: string
          reward_claimed?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_count?: number
          id?: string
          is_completed?: boolean
          last_updated?: string
          mission_id?: string
          reward_claimed?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mission_progress_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mission_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      missions: {
        Row: {
          created_at: string
          description: string
          id: string
          points_reward: number
          requirement_count: number
          requirement_type: string
          title: string
          title_reward: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          points_reward: number
          requirement_count: number
          requirement_type: string
          title: string
          title_reward?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          points_reward?: number
          requirement_count?: number
          requirement_type?: string
          title?: string
          title_reward?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      nearby_spots: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          distance_meters: number | null
          id: string
          image_url: string | null
          latitude: number
          longitude: number
          name: string
          stop_id: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          distance_meters?: number | null
          id?: string
          image_url?: string | null
          latitude: number
          longitude: number
          name: string
          stop_id: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          distance_meters?: number | null
          id?: string
          image_url?: string | null
          latitude?: number
          longitude?: number
          name?: string
          stop_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nearby_spots_stop_id_fkey"
            columns: ["stop_id"]
            isOneToOne: false
            referencedRelation: "stops"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          data: Json | null
          id: string
          is_read: boolean | null
          message: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message: string
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      post_comments: {
        Row: {
          content: string
          created_at: string | null
          hub_post: string | null
          id: string
          stop_post: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          hub_post?: string | null
          id?: string
          stop_post?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          hub_post?: string | null
          id?: string
          stop_post?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_hub_post_fkey"
            columns: ["hub_post"]
            isOneToOne: false
            referencedRelation: "hub_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_comments_stop_post_fkey"
            columns: ["stop_post"]
            isOneToOne: false
            referencedRelation: "stop_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      post_reactions: {
        Row: {
          created_at: string | null
          id: string
          post_hub_id: string | null
          post_stop_id: string | null
          reaction_type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_hub_id?: string | null
          post_stop_id?: string | null
          reaction_type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_hub_id?: string | null
          post_stop_id?: string | null
          reaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_reactions_post_hub_id_fkey"
            columns: ["post_hub_id"]
            isOneToOne: false
            referencedRelation: "hub_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_reactions_post_stop_id_fkey"
            columns: ["post_stop_id"]
            isOneToOne: false
            referencedRelation: "stop_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      post_reports: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          post_type: string
          reason: string
          reporter_id: string | null
          resolved: boolean | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          post_type: string
          reason: string
          reporter_id?: string | null
          resolved?: boolean | null
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          post_type?: string
          reason?: string
          reporter_id?: string | null
          resolved?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "post_reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      price_change_requests: {
        Row: {
          created_at: string | null
          current_price: number
          id: string
          new_price: number
          route_id: string
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_price: number
          id?: string
          new_price: number
          route_id: string
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_price?: number
          id?: string
          new_price?: number
          route_id?: string
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "price_change_requests_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "price_change_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          favorites: Json | null
          favorites_count: number
          fire_count: number | null
          first_name: string | null
          home: string | null
          id: string
          last_name: string | null
          points: number | null
          preferred_language: string | null
          preferred_transport: string | null
          selected_title: string | null
          titles: string[] | null
          total_ride_time: number
          trips: number
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          favorites?: Json | null
          favorites_count?: number
          fire_count?: number | null
          first_name?: string | null
          home?: string | null
          id: string
          last_name?: string | null
          points?: number | null
          preferred_language?: string | null
          preferred_transport?: string | null
          selected_title?: string | null
          titles?: string[] | null
          total_ride_time?: number
          trips?: number
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          favorites?: Json | null
          favorites_count?: number
          fire_count?: number | null
          first_name?: string | null
          home?: string | null
          id?: string
          last_name?: string | null
          points?: number | null
          preferred_language?: string | null
          preferred_transport?: string | null
          selected_title?: string | null
          titles?: string[] | null
          total_ride_time?: number
          trips?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      route_requests: {
        Row: {
          cost: number | null
          created_at: string
          description: string | null
          end_point: string
          id: string
          start_point: string
          status: string | null
          transport_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cost?: number | null
          created_at?: string
          description?: string | null
          end_point: string
          id?: string
          start_point: string
          status?: string | null
          transport_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cost?: number | null
          created_at?: string
          description?: string | null
          end_point?: string
          id?: string
          start_point?: string
          status?: string | null
          transport_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "route_requests_end_point_fkey"
            columns: ["end_point"]
            isOneToOne: false
            referencedRelation: "hubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "route_requests_start_point_fkey"
            columns: ["start_point"]
            isOneToOne: false
            referencedRelation: "hubs"
            referencedColumns: ["id"]
          },
        ]
      }
      route_stops: {
        Row: {
          created_at: string | null
          id: string
          order_number: number
          route_id: string
          stop_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          order_number: number
          route_id: string
          stop_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          order_number?: number
          route_id?: string
          stop_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "route_stops_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "route_stops_stop_id_fkey"
            columns: ["stop_id"]
            isOneToOne: false
            referencedRelation: "stops"
            referencedColumns: ["id"]
          },
        ]
      }
      route_suggestions: {
        Row: {
          created_at: string | null
          estimated_cost: number | null
          from_lat: number
          from_location: string
          from_lon: number
          id: string
          notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          suggested_route_name: string | null
          to_lat: number
          to_location: string
          to_lon: number
          transport_type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          estimated_cost?: number | null
          from_lat: number
          from_location: string
          from_lon: number
          id?: string
          notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          suggested_route_name?: string | null
          to_lat: number
          to_location: string
          to_lon: number
          transport_type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          estimated_cost?: number | null
          from_lat?: number
          from_location?: string
          from_lon?: number
          id?: string
          notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          suggested_route_name?: string | null
          to_lat?: number
          to_location?: string
          to_lon?: number
          transport_type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "route_suggestions_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "route_suggestions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      routes: {
        Row: {
          cost: number
          created_at: string | null
          end_point: string
          hub_id: string | null
          id: string
          instructions: string | null
          name: string
          start_point: string
          transport_type: string
          updated_at: string | null
        }
        Insert: {
          cost: number
          created_at?: string | null
          end_point: string
          hub_id?: string | null
          id?: string
          instructions?: string | null
          name: string
          start_point: string
          transport_type: string
          updated_at?: string | null
        }
        Update: {
          cost?: number
          created_at?: string | null
          end_point?: string
          hub_id?: string | null
          id?: string
          instructions?: string | null
          name?: string
          start_point?: string
          transport_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_hub"
            columns: ["hub_id"]
            isOneToOne: false
            referencedRelation: "hubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "routes_hub_id_fkey"
            columns: ["hub_id"]
            isOneToOne: false
            referencedRelation: "hubs"
            referencedColumns: ["id"]
          },
        ]
      }
      stop_busy_times: {
        Row: {
          busyness_level: number
          created_at: string | null
          day_of_week: number
          hour_of_day: number
          id: string
          safety_level: number
          stop_id: string
          updated_at: string | null
        }
        Insert: {
          busyness_level: number
          created_at?: string | null
          day_of_week: number
          hour_of_day: number
          id?: string
          safety_level: number
          stop_id: string
          updated_at?: string | null
        }
        Update: {
          busyness_level?: number
          created_at?: string | null
          day_of_week?: number
          hour_of_day?: number
          id?: string
          safety_level?: number
          stop_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stop_busy_times_stop_id_fkey"
            columns: ["stop_id"]
            isOneToOne: false
            referencedRelation: "stops"
            referencedColumns: ["id"]
          },
        ]
      }
      stop_posts: {
        Row: {
          content: string
          created_at: string | null
          id: string
          image_url: string | null
          post_images: string[] | null
          route_id: string | null
          stop_id: string
          transport_waiting_for: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          post_images?: string[] | null
          route_id?: string | null
          stop_id: string
          transport_waiting_for?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          post_images?: string[] | null
          route_id?: string | null
          stop_id?: string
          transport_waiting_for?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stop_posts_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stop_posts_stop_id_fkey"
            columns: ["stop_id"]
            isOneToOne: false
            referencedRelation: "stops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stop_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      stop_requests: {
        Row: {
          cost: number | null
          created_at: string
          description: string | null
          id: string
          latitude: number
          longitude: number
          name: string
          route_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cost?: number | null
          created_at?: string
          description?: string | null
          id?: string
          latitude: number
          longitude: number
          name: string
          route_id: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cost?: number | null
          created_at?: string
          description?: string | null
          id?: string
          latitude?: number
          longitude?: number
          name?: string
          route_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stop_requests_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stop_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      stop_waiting: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          journey_id: string | null
          route_id: string | null
          stop_id: string
          transport_type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string
          id?: string
          journey_id?: string | null
          route_id?: string | null
          stop_id: string
          transport_type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          journey_id?: string | null
          route_id?: string | null
          stop_id?: string
          transport_type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stop_waiting_journey_id_fkey"
            columns: ["journey_id"]
            isOneToOne: false
            referencedRelation: "journeys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stop_waiting_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stop_waiting_stop_id_fkey"
            columns: ["stop_id"]
            isOneToOne: false
            referencedRelation: "stops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stop_waiting_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      stops: {
        Row: {
          cost: number | null
          created_at: string | null
          id: string
          image_url: string | null
          latitude: number
          longitude: number
          name: string
          order_number: number | null
          route_id: string | null
          updated_at: string | null
        }
        Insert: {
          cost?: number | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          latitude: number
          longitude: number
          name: string
          order_number?: number | null
          route_id?: string | null
          updated_at?: string | null
        }
        Update: {
          cost?: number | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          latitude?: number
          longitude?: number
          name?: string
          order_number?: number | null
          route_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_route"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          created_at: string | null
          created_by: string
          description: string
          id: string
          priority: string
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string | null
          created_by: string
          description: string
          id?: string
          priority?: string
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          created_at?: string | null
          created_by?: string
          description?: string
          id?: string
          priority?: string
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      taxi_routes: {
        Row: {
          created_at: string
          destination: string
          id: string
          origin: string
          price: number | null
          route_points: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          destination: string
          id?: string
          origin: string
          price?: number | null
          route_points: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          destination?: string
          id?: string
          origin?: string
          price?: number | null
          route_points?: Json
          updated_at?: string
        }
        Relationships: []
      }
      ticket_comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          ticket_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          ticket_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          ticket_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_comments_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      titles: {
        Row: {
          backstory: string | null
          created_at: string | null
          description: string | null
          id: number
          points_required: number
          rarity: string | null
          title: string
        }
        Insert: {
          backstory?: string | null
          created_at?: string | null
          description?: string | null
          id?: number
          points_required: number
          rarity?: string | null
          title: string
        }
        Update: {
          backstory?: string | null
          created_at?: string | null
          description?: string | null
          id?: number
          points_required?: number
          rarity?: string | null
          title?: string
        }
        Relationships: []
      }
      traffic_reports: {
        Row: {
          created_at: string | null
          description: string
          hub_id: string | null
          id: string
          incident_time: string | null
          incident_type: string
          location: string
          reporter_id: string | null
          status: Database["public"]["Enums"]["report_status"] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          hub_id?: string | null
          id?: string
          incident_time?: string | null
          incident_type: string
          location: string
          reporter_id?: string | null
          status?: Database["public"]["Enums"]["report_status"] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          hub_id?: string | null
          id?: string
          incident_time?: string | null
          incident_type?: string
          location?: string
          reporter_id?: string | null
          status?: Database["public"]["Enums"]["report_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "traffic_reports_hub_id_fkey"
            columns: ["hub_id"]
            isOneToOne: false
            referencedRelation: "hubs"
            referencedColumns: ["id"]
          },
        ]
      }
      user_cards: {
        Row: {
          card_holder: string
          card_number: string
          card_type: string
          created_at: string | null
          current_balance: number | null
          id: string
          is_active: boolean | null
          position: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          card_holder: string
          card_number: string
          card_type: string
          created_at?: string | null
          current_balance?: number | null
          id?: string
          is_active?: boolean | null
          position?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          card_holder?: string
          card_number?: string
          card_type?: string
          created_at?: string | null
          current_balance?: number | null
          id?: string
          is_active?: boolean | null
          position?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_journeys: {
        Row: {
          ai_recommendations: string[] | null
          created_at: string
          from_location: Json
          id: string
          journey_details: Json | null
          selected_transport: string | null
          to_location: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_recommendations?: string[] | null
          created_at?: string
          from_location: Json
          id?: string
          journey_details?: Json | null
          selected_transport?: string | null
          to_location: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_recommendations?: string[] | null
          created_at?: string
          from_location?: Json
          id?: string
          journey_details?: Json | null
          selected_transport?: string | null
          to_location?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      webhooks: {
        Row: {
          created_at: string | null
          description: string | null
          events: string[]
          id: string
          is_active: boolean | null
          last_triggered: string | null
          secret: string
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          events: string[]
          id?: string
          is_active?: boolean | null
          last_triggered?: string | null
          secret: string
          url: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          events?: string[]
          id?: string
          is_active?: boolean | null
          last_triggered?: string | null
          secret?: string
          url?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_favorite: {
        Args: { p_entity_id: string; p_entity_type: string; p_user_id: string }
        Returns: undefined
      }
      bump_favorites_count: {
        Args: { p_delta: number; p_user_id: string }
        Returns: undefined
      }
      cleanup_expired_waiting: { Args: never; Returns: undefined }
      cleanup_old_posts: { Args: never; Returns: undefined }
      find_drivers_in_journey: {
        Args: { journey_id: string }
        Returns: {
          driver_id: string
          first_name: string
          last_name: string
          user_id: string
        }[]
      }
      get_favorites_count: {
        Args: { p_entity_id: string; p_entity_type: string }
        Returns: number
      }
      get_user_email: { Args: { user_id: string }; Returns: string }
      handle_login_streak: {
        Args: { input_user_id: string }
        Returns: {
          current_streak: number
          max_streak: number
          points_earned: number
        }[]
      }
      increment_trip: {
        Args: { ride_time: number; user_id: string }
        Returns: {
          new_total_ride_time: number
          new_trips: number
        }[]
      }
      is_admin: { Args: { user_id: string }; Returns: boolean }
      is_driver: { Args: { user_uuid: string }; Returns: boolean }
      is_favorited: {
        Args: { p_entity_id: string; p_entity_type: string; p_user_id: string }
        Returns: boolean
      }
      remove_favorite: {
        Args: { p_entity_id: string; p_entity_type: string; p_user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "user" | "driver"
      report_status: "pending" | "approved" | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user", "driver"],
      report_status: ["pending", "approved", "rejected"],
    },
  },
} as const

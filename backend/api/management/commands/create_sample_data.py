"""
Django management command to create sample conversation data with AI-generated insights
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from api.models import Conversation, Message, ConversationAnalysis
from ai_service.conversation_analyzer import ConversationAnalyzer
import random


class Command(BaseCommand):
    help = 'Creates sample conversation data for testing with AI-generated insights'

    def add_arguments(self, parser):
        parser.add_argument(
            '--count',
            type=int,
            default=10,
            help='Number of conversations to create (default: 10)',
        )
        parser.add_argument(
            '--skip-analysis',
            action='store_true',
            help='Skip AI analysis generation (faster, but no insights)',
        )

    def handle(self, *args, **options):
        count = options['count']
        skip_analysis = options.get('skip_analysis', False)
        
        topics = [
            "Planning a trip to Japan",
            "Learning Python programming",
            "Cooking Italian recipes",
            "Fitness and workout routines",
            "Book recommendations",
            "Career advice",
            "Technology trends",
            "Travel destinations",
            "Starting a business",
            "Learning machine learning",
            "Home improvement projects",
            "Healthy meal planning",
        ]
        
        sample_messages = {
            "Planning a trip to Japan": [
                ("user", "I'm planning a trip to Japan next month. What are the must-visit places?"),
                ("ai", "Japan is a beautiful country with many amazing destinations. Some must-visit places include Tokyo for its modern culture, Kyoto for traditional temples, Osaka for food, and Mount Fuji for natural beauty."),
                ("user", "What's the best time to visit?"),
                ("ai", "Spring (March to May) and autumn (September to November) are the best times. Spring offers cherry blossoms, while autumn has beautiful fall foliage."),
                ("user", "Any tips for first-time visitors?"),
                ("ai", "Learn basic Japanese phrases, get a JR Pass for train travel, respect local customs like removing shoes indoors, and try local cuisine like sushi and ramen."),
                ("user", "How much should I budget for a week?"),
                ("ai", "For a comfortable trip, budget around $150-200 per day including accommodation, food, and activities. Budget hotels cost $50-100/night, while mid-range hotels are $100-200/night."),
            ],
            "Learning Python programming": [
                ("user", "I want to learn Python. Where should I start?"),
                ("ai", "Great choice! Start with Python basics: variables, data types, control structures. Then move to functions, classes, and modules. Practice with small projects."),
                ("user", "What resources do you recommend?"),
                ("ai", "I recommend Python.org's official tutorial, 'Automate the Boring Stuff with Python' book, and platforms like Codecademy or freeCodeCamp for interactive learning."),
                ("user", "How long does it take to become proficient?"),
                ("ai", "With consistent practice (2-3 hours daily), you can become proficient in 3-6 months. Focus on building projects to reinforce learning."),
                ("user", "Should I learn Python 2 or Python 3?"),
                ("ai", "Definitely Python 3! Python 2 is no longer supported. Python 3.8+ is the current standard with many improvements and better features."),
            ],
            "Cooking Italian recipes": [
                ("user", "I want to learn how to make authentic Italian pasta. Where do I start?"),
                ("ai", "Start with fresh pasta dough: mix 100g flour per egg, knead for 10 minutes, rest for 30 minutes. For sauce, use quality tomatoes, fresh basil, and good olive oil."),
                ("user", "What's the secret to good carbonara?"),
                ("ai", "The key is using guanciale (not bacon), fresh eggs, pecorino cheese, and never adding cream. Mix the egg mixture off heat to avoid scrambling."),
                ("user", "Any tips for making risotto?"),
                ("ai", "Use arborio rice, warm broth, constant stirring, and add liquid gradually. Finish with butter and parmesan off heat for creamy texture."),
            ],
            "Fitness and workout routines": [
                ("user", "I'm new to working out. What's a good beginner routine?"),
                ("ai", "Start with 3 days per week: full-body workouts focusing on compound movements like squats, push-ups, and rows. Begin with bodyweight exercises before adding weights."),
                ("user", "How long should each workout be?"),
                ("ai", "For beginners, 30-45 minutes is ideal. Include 5-10 min warm-up, 20-30 min main workout, and 5-10 min cool-down with stretching."),
                ("user", "What about rest days?"),
                ("ai", "Rest days are crucial for recovery. Aim for at least 1-2 rest days between strength training sessions. Light activities like walking are fine on rest days."),
            ],
            "Starting a business": [
                ("user", "I have an idea for a startup. What are the first steps?"),
                ("ai", "Start by validating your idea: talk to potential customers, build an MVP (Minimum Viable Product), and test the market. Create a simple business plan outlining your value proposition."),
                ("user", "How do I validate my idea?"),
                ("ai", "Conduct customer interviews, create surveys, build a landing page to gauge interest, and consider a small pilot program. Look for people willing to pay for your solution."),
                ("user", "What about funding?"),
                ("ai", "Start with bootstrapping or friends/family. Then consider angel investors, accelerators, or crowdfunding. Have a clear pitch deck and financial projections ready."),
            ],
        }
        
        analyzer = None
        if not skip_analysis:
            try:
                analyzer = ConversationAnalyzer()
                self.stdout.write(self.style.SUCCESS('AI Analyzer initialized. Generating insights...'))
            except Exception as e:
                self.stdout.write(
                    self.style.WARNING(f'Could not initialize AI Analyzer: {e}. Using fallback analysis.')
                )
                analyzer = None
        
        created_count = 0
        for i in range(count):
            topic = random.choice(topics)
            days_ago = random.randint(1, 30)
            conversation = Conversation.objects.create(
                title=topic,
                start_time=timezone.now() - timedelta(days=days_ago),
                status='ended',  # All sample conversations are ended for testing
            )
            
            # Set end time
            conversation.end_time = conversation.start_time + timedelta(
                hours=random.randint(1, 3),
                minutes=random.randint(0, 59)
            )
            conversation.save()
            
            # Add messages
            if topic in sample_messages:
                messages = sample_messages[topic]
            else:
                messages = [
                    ("user", f"Hello, I'd like to discuss {topic.lower()}."),
                    ("ai", f"That's an interesting topic! I'd be happy to help you with {topic.lower()}."),
                    ("user", "Can you tell me more?"),
                    ("ai", "Certainly! Let me provide you with some detailed information."),
                    ("user", "That's helpful, thank you!"),
                    ("ai", "You're welcome! Feel free to ask if you need more information."),
                ]
            
            # Create messages with proper timestamps
            base_timestamp = conversation.start_time
            for idx, (sender, content) in enumerate(messages):
                Message.objects.create(
                    conversation=conversation,
                    content=content,
                    sender=sender,
                    timestamp=base_timestamp + timedelta(minutes=idx * 3 + random.randint(0, 2)),
                )
            
            # Generate AI analysis for ended conversations
            if analyzer:
                try:
                    self.stdout.write(f'Analyzing conversation: {topic}...')
                    analysis_data = analyzer.analyze_conversation(conversation)
                    
                    conversation.summary = analysis_data.get('summary', f"Discussion about {topic}")
                    conversation.save()
                    
                    ConversationAnalysis.objects.create(
                        conversation=conversation,
                        sentiment=analysis_data.get('sentiment', 'neutral'),
                        topics=analysis_data.get('topics', [topic]),
                        action_items=analysis_data.get('action_items', []),
                        key_points=analysis_data.get('key_points', [f"Main topic: {topic}"]),
                    )
                    self.stdout.write(self.style.SUCCESS(f'✓ Generated AI insights for: {topic}'))
                except Exception as e:
                    self.stdout.write(
                        self.style.WARNING(f'Could not generate AI analysis: {e}. Using fallback.')
                    )
                    # Fallback analysis
                    conversation.summary = f"Discussion about {topic} with {len(messages)} messages covering key aspects and recommendations."
                    conversation.save()
                    ConversationAnalysis.objects.create(
                        conversation=conversation,
                        sentiment=random.choice(['positive', 'neutral']),
                        topics=[topic, "general discussion"],
                        action_items=[],
                        key_points=[f"Main topic: {topic}", "User seeking information and advice"],
                    )
            else:
                # Fallback analysis without AI
                conversation.summary = f"Discussion about {topic} with {len(messages)} messages covering key aspects and recommendations."
                conversation.save()
                ConversationAnalysis.objects.create(
                    conversation=conversation,
                    sentiment=random.choice(['positive', 'neutral']),
                    topics=[topic, "general discussion"],
                    action_items=[],
                    key_points=[f"Main topic: {topic}", "User seeking information and advice"],
                )
            
            created_count += 1
            self.stdout.write(
                self.style.SUCCESS(f'Created conversation {created_count}/{count}: {conversation.title}')
            )
        
        self.stdout.write(
            self.style.SUCCESS(
                f'\n✓ Successfully created {created_count} sample conversations with AI-generated insights!'
            )
        )
        self.stdout.write(
            self.style.SUCCESS('You can now test the features:')
        )
        self.stdout.write('  - View conversations in Dashboard')
        self.stdout.write('  - Query past conversations in Intelligence page')
        self.stdout.write('  - View analytics and insights')


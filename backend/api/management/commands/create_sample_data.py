"""
Django management command to create sample conversation data
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from api.models import Conversation, Message, ConversationAnalysis
import random


class Command(BaseCommand):
    help = 'Creates sample conversation data for testing'

    def add_arguments(self, parser):
        parser.add_argument(
            '--count',
            type=int,
            default=5,
            help='Number of conversations to create',
        )

    def handle(self, *args, **options):
        count = options['count']
        
        topics = [
            "Planning a trip to Japan",
            "Learning Python programming",
            "Cooking Italian recipes",
            "Fitness and workout routines",
            "Book recommendations",
            "Career advice",
            "Technology trends",
            "Travel destinations",
        ]
        
        sample_messages = {
            "Planning a trip to Japan": [
                ("user", "I'm planning a trip to Japan next month. What are the must-visit places?"),
                ("ai", "Japan is a beautiful country with many amazing destinations. Some must-visit places include Tokyo for its modern culture, Kyoto for traditional temples, Osaka for food, and Mount Fuji for natural beauty."),
                ("user", "What's the best time to visit?"),
                ("ai", "Spring (March to May) and autumn (September to November) are the best times. Spring offers cherry blossoms, while autumn has beautiful fall foliage."),
                ("user", "Any tips for first-time visitors?"),
                ("ai", "Learn basic Japanese phrases, get a JR Pass for train travel, respect local customs like removing shoes indoors, and try local cuisine like sushi and ramen."),
            ],
            "Learning Python programming": [
                ("user", "I want to learn Python. Where should I start?"),
                ("ai", "Great choice! Start with Python basics: variables, data types, control structures. Then move to functions, classes, and modules. Practice with small projects."),
                ("user", "What resources do you recommend?"),
                ("ai", "I recommend Python.org's official tutorial, 'Automate the Boring Stuff with Python' book, and platforms like Codecademy or freeCodeCamp for interactive learning."),
                ("user", "How long does it take to become proficient?"),
                ("ai", "With consistent practice (2-3 hours daily), you can become proficient in 3-6 months. Focus on building projects to reinforce learning."),
            ],
        }
        
        for i in range(count):
            topic = random.choice(topics)
            conversation = Conversation.objects.create(
                title=topic,
                start_time=timezone.now() - timedelta(days=random.randint(1, 30)),
                status=random.choice(['active', 'ended']),
            )
            
            if conversation.status == 'ended':
                conversation.end_time = conversation.start_time + timedelta(hours=random.randint(1, 3))
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
                ]
            
            for sender, content in messages:
                Message.objects.create(
                    conversation=conversation,
                    content=content,
                    sender=sender,
                    timestamp=conversation.start_time + timedelta(minutes=len(Message.objects.filter(conversation=conversation)) * 5),
                )
            
            # Generate analysis for ended conversations
            if conversation.status == 'ended':
                conversation.summary = f"Discussion about {topic} with {len(messages)} messages covering key aspects and recommendations."
                conversation.save()
                
                ConversationAnalysis.objects.create(
                    conversation=conversation,
                    sentiment=random.choice(['positive', 'neutral', 'positive']),
                    topics=[topic, "general discussion"],
                    action_items=[],
                    key_points=[f"Main topic: {topic}", "User seeking information and advice"],
                )
            
            self.stdout.write(
                self.style.SUCCESS(f'Created conversation: {conversation.title}')
            )
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully created {count} sample conversations')
        )


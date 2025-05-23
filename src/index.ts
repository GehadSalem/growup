import express from 'express';
import { AppDataSource } from './dbConfig/data-source';
// import usersRoutes from './Routes/users.route';
// import habitsRoutes from './Routes/habits.route';

const app = express();
const port = 3000;
app.use(express.json());
AppDataSource.initialize()
  .then(() => {
    console.log(' Database connected');

    app.get('/', (req, res) => {
      res.send('TypeORM with Express!');
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
// import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { DataSource } from 'typeorm';
import { User } from './entities/User';
import { Habit } from './entities/Habit';
import { Expense } from './entities/Expense';
import { Goal } from './entities/Goal';
import { EmergencyFund } from './entities/EmergencyFund';
import { Notification } from './entities/Notification';
import { createDailyTaskScheduler } from './utils/scheduler';
import { DailyTask } from './entities/DailyTask';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'life_organizer',
  entities: [User, Habit, Expense, Goal, EmergencyFund, Notification, DailyTask],
  synchronize: true,
  logging: process.env.NODE_ENV === 'development',
});

class App {
  getApp() {
    throw new Error('Method not implemented.');
  }
  private app: express.Application;
  private port: number;

  constructor() {
    this.app = express();
    this.port = parseInt(process.env.PORT || '3000', 10);
    this.initializeMiddlewares();
    this.initializeDatabase();
    this.initializeRoutes();
    this.initializeErrorHandling();
    this.initializeBackgroundServices();
  }

  private initializeMiddlewares(): void {
    this.app.use(cors({
      origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }));
    
    this.app.use(express.json({ limit: '10kb' }));
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(helmet());
    
    // if (process.env.NODE_ENV === 'development') {
    //   this.app.use(morgan('dev'));
    // }

    this.app.use(rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      message: 'لقد تجاوزت الحد المسموح من الطلبات، يرجى المحاولة لاحقاً',
      standardHeaders: true,
      legacyHeaders: false
    }));
  }

  private async initializeDatabase(): Promise<void> {
    try {
      await AppDataSource.initialize();
      console.log('✅ تم الاتصال بقاعدة البيانات بنجاح');
    } catch (error) {
      console.error('❌ فشل الاتصال بقاعدة البيانات', error);
      process.exit(1);
    }
  }

  private initializeRoutes(): void {
    // Routes will be defined here
    this.app.get('/', (req, res) => {
      res.send('تطبيق منظم الحياة الشخصية - API');
    });

    this.app.get('/health', (req, res) => {
      res.status(200).json({ status: 'healthy' });
    });
    // app.use('/api/users', usersRoutes);
    // app.use('/api/habits', habitsRoutes);

    app.listen(port, () => {
      console.log(`🚀 Server is running at http://localhost:${port}`);
    });
  })
  .catch((error: any) => console.error('❌ Database connection failed', error));


    // API routes
    this.app.use('/api/auth', require('./routes/auth.routes'));
    this.app.use('/api/habits', require('./routes/habit.routes'));
    this.app.use('/api/expenses', require('./routes/expense.routes'));
    this.app.use('/api/goals', require('./routes/goal.routes'));
    this.app.use('/api/emergency-fund', require('./routes/emergency.routes'));
    this.app.use('/api/notifications', require('./routes/notification.routes'));
    this.app.use('/api/daily-tasks', require('./routes/dailyTask.routes'));
  }

  private initializeErrorHandling(): void {
    this.app.use((req, res) => {
      res.status(404).json({ 
        status: 'error',
        message: 'الرابط غير موجود',
        code: 404
      });
    });

    this.app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      console.error(err.stack);
      res.status(500).json({
        status: 'error',
        message: 'حدث خطأ في الخادم',
        code: 500
      });
    });
  }

  private initializeBackgroundServices(): void {
    if (process.env.NODE_ENV !== 'test') {
      const tasks: DailyTask[] = []; // Replace with actual tasks array
      const notifyCallback = (task: DailyTask) => {
        console.log(`Reminder for task: ${task.name}`);
      };
      createDailyTaskScheduler(tasks, notifyCallback);
      // Initialize other background services here
    }
  }

  public start(): void {
    this.app.listen(this.port, () => {
      console.log(`🚀 الخادم يعمل على http://localhost:${this.port}`);
    });
  }
}

if (require.main === module) {
  const app = new App();
  app.start();
}

export default new App().getApp();
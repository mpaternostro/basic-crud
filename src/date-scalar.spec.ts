import { DateScalar } from './date-scalar';

describe('GraphQL Date Scalar', () => {
  let dateScalar: DateScalar;

  beforeEach(() => {
    dateScalar = new DateScalar();
  });

  it('should parse number to date', () => {
    expect(dateScalar.parseValue(1)).toBeInstanceOf(Date);
  });

  it('should serialize date to string', () => {
    const dateStr = dateScalar.serialize(new Date());
    expect(typeof dateStr).toBe('string');
  });

  it('should parse literal to Date', () => {
    const ast = {
      kind: 'IntValue',
    };
    expect(dateScalar.parseLiteral(ast as any)).toBeInstanceOf(Date);
  });

  it('should fail to parse literal to Date and return null', () => {
    const ast = {
      kind: 'StringValue',
    };
    expect(dateScalar.parseLiteral(ast as any)).toBeNull();
  });
});
